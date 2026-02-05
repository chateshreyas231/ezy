-- Migration 019: Fix deal_rooms INSERT policy recursion
-- The INSERT policy is causing infinite recursion when evaluating RLS
-- Solution: Use a SECURITY DEFINER function to bypass RLS checks

-- Create a function to check if user can create a deal room for a match
CREATE OR REPLACE FUNCTION can_create_deal_room_for_match(match_uuid UUID, user_uuid UUID)
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

-- Create a function to check if user can add participants to a deal room
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

-- Drop the existing INSERT policies
DROP POLICY IF EXISTS "Users can create deal rooms for their matches" ON deal_rooms;
DROP POLICY IF EXISTS "Users can add participants to deal rooms they're in" ON deal_participants;

-- Create a new INSERT policy for deal_rooms that uses the SECURITY DEFINER function
-- This avoids RLS recursion because the function bypasses RLS checks
CREATE POLICY "Users can create deal rooms for their matches"
  ON deal_rooms FOR INSERT
  WITH CHECK (
    can_create_deal_room_for_match(match_id, auth.uid())
  );

-- Create a new INSERT policy for deal_participants
-- Users can insert participants if:
-- 1. They are inserting themselves as a participant, OR
-- 2. They are buyer/seller in the match (allows creating participants for both parties)
CREATE POLICY "Users can add participants to deal rooms they're in"
  ON deal_participants FOR INSERT
  WITH CHECK (
    -- Case 1: User is inserting themselves
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer/seller in the match (can create participants for both parties)
    can_add_participant_to_deal_room(deal_room_id, auth.uid())
  );

-- Also fix conversations INSERT policy to avoid recursion
DROP POLICY IF EXISTS "Users can create conversations in their deal rooms" ON conversations;

CREATE POLICY "Users can create conversations in their deal rooms"
  ON conversations FOR INSERT
  WITH CHECK (
    can_add_participant_to_deal_room(deal_room_id, auth.uid())
  );
