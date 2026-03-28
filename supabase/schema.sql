-- ============================================================
-- Buddhi Align App — Supabase schema
-- Run this in your Supabase project's SQL Editor.
-- ============================================================

-- Enable the pgcrypto extension for gen_random_uuid().
-- (Already enabled by default on Supabase; safe to run again.)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- module_entries
--
-- A single generic table for all six spiritual modules.
-- Module-specific fields live in the `data` JSONB column so
-- the schema never needs to change when fields are added to a
-- module.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_entries (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Any module name is accepted here. The allowed-module list is enforced
  -- in the API layer (apps/frontend/app/api/[module]/route.ts) so new
  -- modules can be added without a schema migration.
  module     TEXT        NOT NULL,
  data       JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for the most common query pattern: filter by module name.
CREATE INDEX IF NOT EXISTS idx_module_entries_module
  ON module_entries (module);

-- Index for sorting / filtering by creation time.
CREATE INDEX IF NOT EXISTS idx_module_entries_created_at
  ON module_entries (created_at);

-- ------------------------------------------------------------
-- Trigger: keep updated_at current on every UPDATE.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION _buddhi_update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS module_entries_updated_at ON module_entries;
CREATE TRIGGER module_entries_updated_at
  BEFORE UPDATE ON module_entries
  FOR EACH ROW EXECUTE FUNCTION _buddhi_update_updated_at();

-- ============================================================
-- Row-Level Security (optional but recommended)
--
-- Uncomment the block below if you add user authentication via
-- Supabase Auth. The API routes use the SERVICE_ROLE key which
-- bypasses RLS, so entries remain server-managed.
-- ============================================================
-- ALTER TABLE module_entries ENABLE ROW LEVEL SECURITY;
--
-- -- Allow service-role to bypass RLS (no explicit policy needed).
-- -- If you expose module_entries directly from the client with the
-- -- anon key, add user-scoped policies here.
