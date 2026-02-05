-- Migration 009: Fix deal_participants recursion by checking matches directly
-- The issue: deal_participants policy queries deal_rooms, which might trigger
-- RLS evaluation on deal_rooms, potentially causing recursion.
-- Solution: Join directly to matches via deal_rooms.match_id without triggering
-- RLS evaluation on deal_rooms by using a subquery that bypasses RLS checks.

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;

-- Create a policy that checks matches directly via deal_rooms.match_id
-- This avoids triggering RLS on deal_rooms by using a direct join
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Case 1: User is the participant themselves
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer or seller in the match
    -- We join deal_rooms and matches directly to avoid RLS recursion
    EXISTS (
      SELECT 1 
      FROM deal_rooms dr
      INNER JOIN matches m ON m.id = dr.match_id
      WHERE dr.id = deal_participants.deal_room_id
      AND (
        m.buyer_id = auth.uid()
        OR m.seller_id = auth.uid()
      )
    )
  );

-- Also ensure deal_rooms policy doesn't query deal_participants
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = deal_rooms.match_id
      AND (
        m.buyer_id = auth.uid()
        OR m.seller_id = auth.uid()
      )
    )
  );

