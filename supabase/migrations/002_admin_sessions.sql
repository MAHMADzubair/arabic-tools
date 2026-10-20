-- ============================================================
-- Migration: 002_admin_sessions
-- Idempotent setup for secure, serverless-compatible admin sessions
-- and cross-instance login rate limiting.
--
-- Run in Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- ── 1. Admin Sessions Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash  TEXT        PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  ip_address  TEXT,
  user_agent  TEXT
);

-- Index for fast token validation (active, non-expired, non-revoked lookups)
CREATE INDEX IF NOT EXISTS idx_admin_sessions_lookup
  ON admin_sessions (token_hash, expires_at)
  WHERE revoked_at IS NULL;

-- Index for cleanup of expired sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
  ON admin_sessions (expires_at);

-- ── 2. Admin Login Attempts Table (Cross-instance rate limiting) ─
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id           BIGSERIAL   PRIMARY KEY,
  ip_address   TEXT        NOT NULL,
  attempt_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast IP rate-limit counting within time windows
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_time
  ON admin_login_attempts (ip_address, attempt_time DESC);

-- ── 3. Row Level Security (Strict Server-Side Isolation) ──────
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Revoke all public / anonymous permissions
REVOKE ALL ON admin_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON admin_login_attempts FROM PUBLIC, anon, authenticated;

-- Grant access ONLY to service_role (used strictly by server-side APIs)
GRANT ALL ON admin_sessions TO service_role;
GRANT ALL ON admin_login_attempts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE admin_login_attempts_id_seq TO service_role;

-- Strict service-role policies (deny all for public)
DROP POLICY IF EXISTS "service_role_admin_sessions" ON admin_sessions;
CREATE POLICY "service_role_admin_sessions" ON admin_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_admin_attempts" ON admin_login_attempts;
CREATE POLICY "service_role_admin_attempts" ON admin_login_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── 4. Scheduled Cleanup Stored Procedure ─────────────────────
-- Hardened with fixed search_path = public, pg_temp to prevent search path hijacking
CREATE OR REPLACE FUNCTION cleanup_expired_admin_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Delete sessions expired more than 24 hours ago
  DELETE FROM admin_sessions
  WHERE expires_at < now() - INTERVAL '24 hours';

  -- Delete login attempts older than 24 hours
  DELETE FROM admin_login_attempts
  WHERE attempt_time < now() - INTERVAL '24 hours';
END;
$$;

-- Restrict execute permissions strictly to service_role
REVOKE EXECUTE ON FUNCTION cleanup_expired_admin_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_admin_data() TO service_role;

-- ── 5. Transaction-Safe Atomic Rate Limiting Stored Procedure ──
-- Uses pg_advisory_xact_lock on the IP hash to eliminate concurrency race conditions.
-- Guarantees atomic check-and-insert serialized per-IP without locking other IPs.
CREATE OR REPLACE FUNCTION check_and_record_login_attempt_atomic(
  p_ip           TEXT,
  p_window_sec   INT DEFAULT 900,  -- 15 minutes = 900 seconds
  p_max_attempts INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_lock_key BIGINT;
  v_window_start TIMESTAMPTZ;
  v_count INT;
  v_allowed BOOLEAN;
BEGIN
  -- 64-bit advisory lock key derived deterministically from IP text
  -- hashtext produces a 32-bit int; casting to bigint ensures safety
  v_lock_key := ('x' || substr(md5(p_ip), 1, 16))::bit(64)::bigint;
  
  -- Acquire transaction-scoped advisory lock for this IP
  PERFORM pg_advisory_xact_lock(v_lock_key);

  v_window_start := now() - (p_window_sec || ' seconds')::INTERVAL;

  -- Count recent attempts in the sliding window
  SELECT count(*) INTO v_count
  FROM admin_login_attempts
  WHERE ip_address = p_ip
    AND attempt_time >= v_window_start;

  -- Record attempt
  INSERT INTO admin_login_attempts (ip_address, attempt_time)
  VALUES (p_ip, now());

  -- If count BEFORE this attempt was >= max, reject (v_count + 1 > max)
  IF v_count >= p_max_attempts THEN
    v_allowed := false;
  ELSE
    v_allowed := true;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'count', v_count + 1,
    'max_attempts', p_max_attempts
  );
END;
$$;

-- Restrict execute permissions strictly to service_role
REVOKE EXECUTE ON FUNCTION check_and_record_login_attempt_atomic(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION check_and_record_login_attempt_atomic(TEXT, INT, INT) TO service_role;

-- ── 6. Recommended Execution Schedule ─────────────────────────
-- Run daily at 03:00 UTC via pg_cron extension (if enabled in Supabase Dashboard → Extensions → pg_cron):
--   SELECT cron.schedule('daily-admin-cleanup', '0 3 * * *', 'SELECT public.cleanup_expired_admin_data();');
-- Or trigger via scheduled GitHub Action / Supabase Edge Function with service_role auth.
