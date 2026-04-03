-- ============================================================
-- Buddhi Align App — Remove user_id FK constraint
--
-- Run this SQL in your Supabase SQL Editor if you previously
-- applied supabase/schema_user_scoped.sql.
--
-- Why:
--   The app uses NextAuth (not Supabase Auth).  NextAuth user IDs
--   are JWTs / provider IDs that are NOT registered in Supabase's
--   auth.users table.  Writing to the user_id column therefore
--   violates the "module_entries_user_id_fkey" foreign-key
--   constraint and causes a 500 on every create/update.
--
--   All user-scoping is handled inside the JSONB `data` column
--   via the __ownerId field, which does not require a FK.
-- ============================================================

-- 1. Drop the foreign-key constraint (keeps the column, just removes FK).
ALTER TABLE module_entries
  DROP CONSTRAINT IF EXISTS module_entries_user_id_fkey;

-- 2. Drop the RLS policies that reference auth.uid() since we no longer
--    use Supabase Auth.  The service-role key used by the API already
--    bypasses RLS anyway.
DROP POLICY IF EXISTS "Users can view own entries"   ON module_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON module_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON module_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON module_entries;

-- 3. Disable RLS now that user isolation is handled at the application layer.
ALTER TABLE module_entries DISABLE ROW LEVEL SECURITY;

-- 4. Optionally nullify stale user_id values that may have been written
--    before the FK was dropped (safe to skip if column is already empty).
-- UPDATE module_entries SET user_id = NULL WHERE user_id IS NOT NULL;

-- ============================================================
-- After running this migration, redeploy the app.  The supabase.ts
-- provider never writes to user_id again — ownership is tracked
-- exclusively via __ownerId inside the JSONB data column.
-- ============================================================
