-- Migration 015: Fix duplicate policies issue
-- This should be run AFTER the main RLS policies migration
-- Only adds the missing Users INSERT policy and ensures other policies exist

-- ============================================================
-- Add Users INSERT Policy (this was missing)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- Ensure Listing Posts INSERT Policy exists (should already exist, but safe to recreate)
-- ============================================================
-- Note: This policy should already exist from migration 003
-- We're just ensuring it's there, but won't error if it already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'listing_posts' 
    AND policyname = 'Users can create listing posts'
  ) THEN
    CREATE POLICY "Users can create listing posts" ON listing_posts
      FOR INSERT WITH CHECK (auth.uid() = agent_id);
  END IF;
END $$;

-- ============================================================
-- Ensure Buyer Need Posts INSERT Policy exists (should already exist, but safe to recreate)
-- ============================================================
-- Note: This policy should already exist from migration 003
-- We're just ensuring it's there, but won't error if it already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'buyer_need_posts' 
    AND policyname = 'Users can create buyer need posts'
  ) THEN
    CREATE POLICY "Users can create buyer need posts" ON buyer_need_posts
      FOR INSERT WITH CHECK (auth.uid() = agent_id);
  END IF;
END $$;

