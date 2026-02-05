-- Migration 022: Fix conversations and messages RLS policies
-- Use SECURITY DEFINER functions to avoid recursion and ensure proper access

-- Ensure can_add_participant_to_deal_room function exists (from migration 019)
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

-- Create function to check if user can access a conversation
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
-- Users can create conversations if they're participants in the deal room
CREATE POLICY "Users can create conversations in their deal rooms"
  ON conversations FOR INSERT
  WITH CHECK (
    can_add_participant_to_deal_room(deal_room_id, auth.uid())
  );

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
