-- Migration 023: Fix conversation INSERT policy
-- Replace can_add_participant_to_deal_room with a more robust function
-- that handles edge cases better

-- Update can_add_participant_to_deal_room to be more robust
-- This is the same function from migration 019/022, but we ensure it's up to date
CREATE OR REPLACE FUNCTION can_add_participant_to_deal_room(deal_room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  match_uuid UUID;
BEGIN
  -- Get the match_id from deal_rooms without triggering RLS
  -- SECURITY DEFINER allows us to bypass RLS checks
  SELECT dr.match_id INTO match_uuid
  FROM deal_rooms dr
  WHERE dr.id = deal_room_uuid
  LIMIT 1;
  
  -- Check if user is buyer or seller in the match
  IF match_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
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

-- Drop existing conversation INSERT policy
DROP POLICY IF EXISTS "Users can create conversations in their deal rooms" ON conversations;
DROP POLICY IF EXISTS "Participants can create conversations" ON conversations;

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Recreate the INSERT policy using the updated function
-- This allows users to create conversations if they're buyer/seller in the match
CREATE POLICY "Users can create conversations in their deal rooms"
  ON conversations FOR INSERT
  WITH CHECK (
    can_add_participant_to_deal_room(deal_room_id, auth.uid())
  );
