-- Migration 005: Comprehensive fix for deal_participants recursion
-- Drop ALL existing policies on deal_participants and recreate with non-recursive version

-- Drop all existing policies on deal_participants
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;
DROP POLICY IF EXISTS "Participants can read deal participants" ON deal_participants;

-- Create a simple, non-recursive policy
-- Users can see participants if:
-- 1. They are the participant themselves (profile_id = auth.uid()), OR
-- 2. They are the buyer or seller in the match
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Case 1: User is the participant themselves
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer or seller in the match (check via matches table, not deal_participants)
    EXISTS (
      SELECT 1 FROM deal_rooms dr
      JOIN matches m ON m.id = dr.match_id
      WHERE dr.id = deal_participants.deal_room_id
      AND (
        m.buyer_id = auth.uid()
        OR m.seller_id = auth.uid()
      )
    )
  );

