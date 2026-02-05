-- Migration 011: Fix deal_rooms recursion with SECURITY DEFINER function
-- The deal_rooms policy is causing recursion, likely because it's being evaluated
-- when other policies query deal_rooms. Use a SECURITY DEFINER function to bypass RLS.

-- Create a function to check if user is in a match (for deal_rooms)
CREATE OR REPLACE FUNCTION is_user_in_match(match_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Drop the existing deal_rooms policy
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;

-- Create a policy that uses the SECURITY DEFINER function
-- This avoids RLS recursion because the function bypasses RLS checks
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    is_user_in_match(match_id, auth.uid())
  );

-- Also update the deal_participants function to use a simpler approach
-- that doesn't query deal_rooms at all
-- First drop the policy that depends on it
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;

-- Now recreate the function
CREATE OR REPLACE FUNCTION is_user_in_deal_room_match(deal_room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  match_uuid UUID;
BEGIN
  -- Get the match_id from deal_rooms without triggering RLS
  SELECT dr.match_id INTO match_uuid
  FROM deal_rooms dr
  WHERE dr.id = deal_room_uuid
  LIMIT 1;
  
  -- Check if user is in the match
  IF match_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN is_user_in_match(match_uuid, user_uuid);
END;
$$;

-- Recreate the policy
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Case 1: User is the participant themselves
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer or seller in the match (using function to avoid recursion)
    is_user_in_deal_room_match(deal_room_id, auth.uid())
  );

