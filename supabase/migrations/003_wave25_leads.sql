-- ============================================================
-- Migration: 003_wave25_leads
-- Wave 25 "help me integrate" requests from /ar/sa/zatca-wave-checker
-- Run once in Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS wave25_leads (
  id                TEXT        PRIMARY KEY,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  name              TEXT        NOT NULL,
  business_name     TEXT        NOT NULL,
  whatsapp          TEXT        NOT NULL,
  email             TEXT,
  invoicing_system  TEXT        NOT NULL,
  trigger_years     TEXT,
  consent_contact   BOOLEAN     NOT NULL DEFAULT false,
  consent_share     BOOLEAN     NOT NULL DEFAULT false,
  status            TEXT        NOT NULL DEFAULT 'new',
  referrer          TEXT,
  user_agent        TEXT
);

CREATE INDEX IF NOT EXISTS idx_wave25_leads_created_at ON wave25_leads (created_at DESC);

-- Row Level Security: no public access; the API uses the service role key.
ALTER TABLE wave25_leads ENABLE ROW LEVEL SECURITY;
