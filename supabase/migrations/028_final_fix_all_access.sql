-- Migration 028: Final comprehensive fix for all access issues
-- This migration ensures deal rooms, participants, and conversations are accessible
-- Uses only SECURITY DEFINER functions to avoid any RLS recursion

-- ============================================
-- STEP 1: Ensure all helper functions exist and are correct
-- ============================================

-- Function to check if user is in a match (for deal_rooms)
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

-- Function to check if user can add participant (for conversations INSERT)
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

-- Function to check if user can access a conversation
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
  
  -- Get match_id from deal_room
  SELECT dr.match_id INTO match_uuid
  FROM deal_rooms dr
  WHERE dr.id = room_uuid
  LIMIT 1;
  
  IF match_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is buyer/seller in the match
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
-- STEP 2: Fix deal_rooms SELECT policy (NO recursion - only match check)
-- ============================================

DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;

ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

-- Use ONLY the match check via SECURITY DEFINER function (no participant check to avoid recursion)
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    is_user_in_match(match_id, auth.uid())
  );

-- ============================================
-- STEP 3: Fix deal_participants SELECT policy
-- ============================================

DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;

ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;

-- Use SECURITY DEFINER function to avoid recursion
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

CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Fast path: User is the participant themselves
    profile_id = auth.uid()
    OR
    -- Fallback: Use SECURITY DEFINER function to check match (bypasses RLS)
    is_user_in_match_for_deal_room(deal_room_id, auth.uid())
  );

-- ============================================
-- STEP 4: Fix conversations policies
-- ============================================

DROP POLICY IF EXISTS "Users can view conversations in their deal rooms" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations in their deal rooms" ON conversations;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations in their deal rooms"
  ON conversations FOR SELECT
  USING (
    can_access_conversation(id, auth.uid())
  );

CREATE POLICY "Users can create conversations in their deal rooms"
  ON conversations FOR INSERT
  WITH CHECK (
    can_add_participant_to_deal_room(deal_room_id, auth.uid())
  );

-- ============================================
-- STEP 5: Fix messages policies
-- ============================================

DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in accessible conversations" ON messages;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in accessible conversations"
  ON messages FOR SELECT
  USING (
    can_access_conversation(conversation_id, auth.uid())
  );

CREATE POLICY "Users can insert messages in accessible conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_profile_id
    AND can_access_conversation(conversation_id, auth.uid())
  );

-- ============================================
-- STEP 6: Ensure deal rooms exist for all matches
-- ============================================

-- Create deal rooms for matches that don't have them
INSERT INTO deal_rooms (match_id, status)
SELECT 
  m.id as match_id,
  'matched' as status
FROM matches m
WHERE NOT EXISTS (
  SELECT 1 
  FROM deal_rooms dr 
  WHERE dr.match_id = m.id
)
ON CONFLICT DO NOTHING;

-- Create participants for deal rooms that don't have them
INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal)
SELECT 
  dr.id as deal_room_id,
  m.buyer_id as profile_id,
  'buyer' as role_in_deal
FROM deal_rooms dr
JOIN matches m ON m.id = dr.match_id
WHERE NOT EXISTS (
  SELECT 1 
  FROM deal_participants dp 
  WHERE dp.deal_room_id = dr.id 
  AND dp.profile_id = m.buyer_id
)
ON CONFLICT DO NOTHING;

INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal)
SELECT 
  dr.id as deal_room_id,
  m.seller_id as profile_id,
  'seller' as role_in_deal
FROM deal_rooms dr
JOIN matches m ON m.id = dr.match_id
WHERE NOT EXISTS (
  SELECT 1 
  FROM deal_participants dp 
  WHERE dp.deal_room_id = dr.id 
  AND dp.profile_id = m.seller_id
)
ON CONFLICT DO NOTHING;

-- Create conversations for deal rooms that don't have them
INSERT INTO conversations (deal_room_id)
SELECT 
  dr.id as deal_room_id
FROM deal_rooms dr
WHERE NOT EXISTS (
  SELECT 1 
  FROM conversations c 
  WHERE c.deal_room_id = dr.id
)
ON CONFLICT DO NOTHING;
