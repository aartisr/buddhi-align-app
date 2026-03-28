-- ============================================================
-- Buddhi Align App — User-Scoped Row-Level Security Migration
--
-- Run this AFTER supabase/schema.sql if you want entries to be
-- scoped per authenticated Supabase Auth user.
--
-- This is OPTIONAL for single-user or service-role-only setups.
-- The application's API routes use the service-role key which
-- bypasses RLS, so all server-side reads/writes remain unaffected.
-- ============================================================

-- 1. Add a user_id column to link entries to Supabase Auth users.
ALTER TABLE module_entries
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Index for fast per-user queries.
CREATE INDEX IF NOT EXISTS idx_module_entries_user_id
  ON module_entries (user_id);

-- 3. Enable Row-Level Security on the table.
ALTER TABLE module_entries ENABLE ROW LEVEL SECURITY;

-- 4. Service-role bypasses RLS automatically — no explicit policy needed for
--    server-side API routes that use SUPABASE_SERVICE_ROLE_KEY.

-- 5. Client-side anon/authenticated policies (optional — only needed if you
--    ever read/write module_entries directly from the browser SDK).
--
-- Allow an authenticated user to manage their own entries:
DROP POLICY IF EXISTS "Users can view own entries" ON module_entries;
CREATE POLICY "Users can view own entries"
  ON module_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entries" ON module_entries;
CREATE POLICY "Users can insert own entries"
  ON module_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON module_entries;
CREATE POLICY "Users can update own entries"
  ON module_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON module_entries;
CREATE POLICY "Users can delete own entries"
  ON module_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- To backfill existing entries to a specific user, run:
--   UPDATE module_entries SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- ============================================================
