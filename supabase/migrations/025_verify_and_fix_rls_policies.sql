-- Migration 025: Verify and fix RLS policies for deal_rooms, conversations, and messages
-- This ensures all the necessary functions and policies are in place

-- ============================================
-- STEP 1: Ensure is_user_in_match function exists and is correct
-- ============================================

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

-- ============================================
-- STEP 2: Ensure deal_rooms SELECT policy is correct
-- ============================================

-- Drop and recreate deal_rooms SELECT policy
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;

-- Ensure RLS is enabled
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

-- Create the SELECT policy with multiple access paths:
-- 1. User is buyer/seller in the match (via function)
-- 2. User is a participant in the deal room (direct check, faster)
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    -- Fast path: Check if user is a participant (no function call needed)
    EXISTS (
      SELECT 1
      FROM deal_participants dp
      WHERE dp.deal_room_id = deal_rooms.id
      AND dp.profile_id = auth.uid()
    )
    OR
    -- Fallback: Check if user is buyer/seller in the match (uses function)
    is_user_in_match(match_id, auth.uid())
  );

-- ============================================
-- STEP 3: Ensure can_add_participant_to_deal_room function exists
-- ============================================

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

-- ============================================
-- STEP 4: Ensure can_access_conversation function exists
-- ============================================

CREATE OR REPLACE FUNCTION can_access_conversation(conv_id UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  room_uuid UUID;
  match_uuid UUID;
BEGIN
  -- Get deal_room_id from conversation
  SELECT c.deal_room_id INTO room_uuid
  FROM conversations c
  WHERE c.id = conv_id
  LIMIT 1;
  
  IF room_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is a participant via deal_participants (fast path)
  IF EXISTS (
    SELECT 1
    FROM deal_participants dp
    WHERE dp.deal_room_id = room_uuid
    AND dp.profile_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback: Check if user is buyer/seller in the match
  SELECT dr.match_id INTO match_uuid
  FROM deal_rooms dr
  WHERE dr.id = room_uuid
  LIMIT 1;
  
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

-- ============================================
-- STEP 5: Ensure conversations policies are correct
-- ============================================

-- Drop existing conversation policies
DROP POLICY IF EXISTS "Users can view conversations in their deal rooms" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations in their deal rooms" ON conversations;
DROP POLICY IF EXISTS "Participants can create conversations" ON conversations;

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy for conversations
CREATE POLICY "Users can view conversations in their deal rooms"
  ON conversations FOR SELECT
  USING (
    can_access_conversation(id, auth.uid())
  );

-- Create INSERT policy for conversations
CREATE POLICY "Users can create conversations in their deal rooms"
  ON conversations FOR INSERT
  WITH CHECK (
    can_add_participant_to_deal_room(deal_room_id, auth.uid())
  );

-- ============================================
-- STEP 6: Ensure messages policies are correct
-- ============================================

-- Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Participants can read messages" ON messages;
DROP POLICY IF EXISTS "Participants can create messages" ON messages;

-- Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy for messages
CREATE POLICY "Users can view messages in accessible conversations"
  ON messages FOR SELECT
  USING (
    can_access_conversation(conversation_id, auth.uid())
  );

-- Create INSERT policy for messages
CREATE POLICY "Users can insert messages in accessible conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_profile_id
    AND can_access_conversation(conversation_id, auth.uid())
  );
