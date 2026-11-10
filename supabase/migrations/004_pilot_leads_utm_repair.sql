-- ============================================================
-- Migration: 004_pilot_leads_utm_repair
-- Why: /api/pilot inserts utm_source, utm_medium, utm_campaign,
-- utm_content and utm_term, but 001_pilot_leads.sql never created those
-- columns, and qemlo-production has no pilot_leads table at all.
-- Every pilot form submission in production therefore fails with a 503.
--
-- Safe to run on any project (production, staging, or a project where 001
-- was already applied): every statement is idempotent.
-- Apply: Supabase Dashboard -> SQL Editor -> paste -> Run.
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

-- Columns the API writes that 001 never created.
ALTER TABLE pilot_leads ADD COLUMN IF NOT EXISTS utm_source   TEXT;
ALTER TABLE pilot_leads ADD COLUMN IF NOT EXISTS utm_medium   TEXT;
ALTER TABLE pilot_leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE pilot_leads ADD COLUMN IF NOT EXISTS utm_content  TEXT;
ALTER TABLE pilot_leads ADD COLUMN IF NOT EXISTS utm_term     TEXT;

CREATE INDEX IF NOT EXISTS idx_pilot_leads_created_at ON pilot_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_leads_priority   ON pilot_leads (priority);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pilot_leads_email_unique ON pilot_leads (email);

-- Server-side only: no anon / authenticated access.
ALTER TABLE pilot_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_only" ON pilot_leads;
CREATE POLICY "service_role_only" ON pilot_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
