-- Migration 013: Fix buyer_need_posts INSERT policy
-- Ensures users can create buyer need posts

-- Policy already exists in migration 003, but ensure it's correct
DROP POLICY IF EXISTS "Users can create buyer need posts" ON buyer_need_posts;

CREATE POLICY "Users can create buyer need posts" ON buyer_need_posts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

