-- Migration 014: Combined fixes for listing creation and role switching
-- Applies all three critical migrations at once

-- ============================================================
-- Migration 011: Users INSERT Policy
-- ============================================================
-- Allows users to create their own profile row on signup
-- This fixes the RLS error when upsertUser() tries to create a new user row

DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- Migration 012: Listing Posts INSERT Policy
-- ============================================================
-- Allows users to create listing posts (needed for listing creation)

DROP POLICY IF EXISTS "Users can create listing posts" ON listing_posts;

CREATE POLICY "Users can create listing posts" ON listing_posts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- ============================================================
-- Migration 013: Buyer Need Posts INSERT Policy
-- ============================================================
-- Ensures users can create buyer need posts

DROP POLICY IF EXISTS "Users can create buyer need posts" ON buyer_need_posts;

CREATE POLICY "Users can create buyer need posts" ON buyer_need_posts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

