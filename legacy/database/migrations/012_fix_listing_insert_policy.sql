-- Migration 012: Fix listing_posts INSERT policy
-- Allows users to create listing posts (needed for listing creation)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create listing posts" ON listing_posts;

-- Create policy that allows authenticated users to create listings
CREATE POLICY "Users can create listing posts" ON listing_posts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

