-- Migration 004: Fix infinite recursion in deal_participants RLS policy
-- The policy was checking deal_participants from within deal_participants, causing recursion
-- Solution: Check matches table instead (avoids recursion)

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;

-- Create a new policy that checks matches table instead (avoids recursion)
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
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

