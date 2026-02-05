-- Migration 020: Fix deal_participants SELECT access
-- Ensure users can always see their own participant records
-- Also ensure they can see participants if they're in the match

-- Create a function to check if user is in a match (for deal_participants)
-- This function bypasses RLS to check matches directly
CREATE OR REPLACE FUNCTION is_user_in_match_for_deal_room(deal_room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  match_uuid UUID;
BEGIN
  -- Get match_id from deal_rooms (bypassing RLS with SECURITY DEFINER)
  SELECT dr.match_id INTO match_uuid
  FROM deal_rooms dr
  WHERE dr.id = deal_room_uuid
  LIMIT 1;
  
  IF match_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is buyer or seller in the match
  RETURN EXISTS (
    SELECT 1
    FROM matches m
    WHERE m.id = match_uuid
    AND (
      m.buyer_id = user_uuid
      OR m.seller_id = user_uuid
    )
  );
END;
$$;

-- Drop all existing policies that might conflict
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;
DROP POLICY IF EXISTS "Participants can read deal participants" ON deal_participants;

-- Ensure RLS is enabled
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;

-- Create a new policy that explicitly checks profile_id first (for performance)
-- PostgreSQL will short-circuit the OR, so if profile_id matches, function won't be called
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Case 1: User is the participant themselves (fast path, no function call)
    -- This should handle the most common case where users query their own records
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer or seller in the match (uses function to avoid recursion)
    -- This allows users to see other participants in the same deal room
    is_user_in_match_for_deal_room(deal_room_id, auth.uid())
  );
