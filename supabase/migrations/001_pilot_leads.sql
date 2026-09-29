-- ============================================================
-- Migration: 001_pilot_leads
-- Run once in Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS pilot_leads (
  id                          TEXT        PRIMARY KEY,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  name                        TEXT        NOT NULL,
  store_name                  TEXT        NOT NULL,
  email                       TEXT        NOT NULL,
  whatsapp                    TEXT        NOT NULL,
  platform                    TEXT        NOT NULL,
  monthly_conversation_volume TEXT        NOT NULL,
  biggest_problem             TEXT        NOT NULL,
  trial_interest              TEXT        NOT NULL,
  priority                    TEXT        NOT NULL DEFAULT 'low',
  source                      TEXT,
  referrer                    TEXT,
  user_agent                  TEXT,
  ip                          TEXT
);

-- Index for fast sorting by date
CREATE INDEX IF NOT EXISTS idx_pilot_leads_created_at
  ON pilot_leads (created_at DESC);

-- Index for priority filtering
CREATE INDEX IF NOT EXISTS idx_pilot_leads_priority
  ON pilot_leads (priority);

-- Prevent true duplicates by email within 2 minutes
-- (dedup is also enforced server-side, this is a DB-level safety net)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pilot_leads_email_unique
  ON pilot_leads (email);

-- Row Level Security: deny all public access
ALTER TABLE pilot_leads ENABLE ROW LEVEL SECURITY;

-- Only the service role key (used server-side) can read/write
-- No public anon access at all
CREATE POLICY "service_role_only" ON pilot_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
