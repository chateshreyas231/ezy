-- Migration 006: Fix infinite recursion between deal_rooms and deal_participants
-- The deal_rooms policy was querying deal_participants, which queries deal_rooms, causing recursion
-- Solution: Make deal_rooms policy check matches table directly (same as deal_participants)

-- Drop the problematic deal_rooms policy
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;

-- Create a new policy that checks matches table instead (avoids recursion)
-- Users can see deal_rooms if they are buyer or seller in the associated match
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

