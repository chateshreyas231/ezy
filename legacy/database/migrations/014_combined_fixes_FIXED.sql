-- Migration 014: Combined fixes - CORRECTED VERSION
-- Run this AFTER your main RLS policies migration (003_rls_policies.sql)
-- This only adds the missing Users INSERT policy

-- ============================================================
-- Migration 011: Users INSERT Policy (THIS WAS MISSING)
-- ============================================================
-- This is the only policy that needs to be added
-- The listing_posts and buyer_need_posts INSERT policies already exist in migration 003

DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Note: The following policies already exist in migration 003, so we don't need to recreate them:
-- - "Users can create listing posts" (already exists at line ~58)
-- - "Users can create buyer need posts" (already exists at line ~47)

