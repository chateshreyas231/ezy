cd..63-44ca-a6f8-9702b452728a"}]
 ERROR  [TypeError: Cannot read property 'display_name' of null] 

Code: EnhancedTasksTab.tsx
  180 |             {assignee && (
  181 |               <Text style={styles.assignee}>
> 182 |                 Assigned to: {assignee.profile.display_name}
      |                                               ^
  183 |               </Text>
  184 |             )}
  185 |           </View>
Call Stack
  renderTask (components/EnhancedTasksTab.tsx:182:47)
  SectionList.props.renderItem (components/EnhancedTasksTab.tsx:325:45) 

Code: EnhancedTasksTab.tsx
  321 |   return (
  322 |     <View style={styles.container}>
> 323 |       <SectionList
      |       ^
  324 |         sections={sections}
  325 |         renderItem={({ item }) => renderTask(item)}
  326 |         renderSectionHeader={({ section }) => (
Call Stack
  EnhancedTasksTab (components/EnhancedTasksTab.tsx:323:7)
  DealRoomScreen (app/deal/[dealId].tsx:122:15)
  RootLayout (app/_layout.tsx:67:11)-- ============================================================================
-- COMBINED MIGRATION: Fix Deal Rooms Access & Chat Service
-- ============================================================================
-- This migration combines migrations 019, 020, 021, and 022
-- Apply this entire file in Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: Functions for Deal Rooms and Participants
-- ============================================================================

-- Function: Check if user can create a deal room for a match
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

-- Function: Check if user can add participants to a deal room
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

-- Function: Check if user is in a match (for deal_rooms SELECT)
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

-- Function: Check if user is in match for deal room (for deal_participants)
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

-- Function: Check if user can access a conversation
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

-- ============================================================================
-- PART 2: Deal Rooms Policies
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;

-- Create SELECT policy for deal_rooms
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    is_user_in_match(match_id, auth.uid())
  );

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create deal rooms for their matches" ON deal_rooms;

-- Create INSERT policy for deal_rooms
CREATE POLICY "Users can create deal rooms for their matches"
  ON deal_rooms FOR INSERT
  WITH CHECK (
    can_create_deal_room_for_match(match_id, auth.uid())
  );

-- ============================================================================
-- PART 3: Deal Participants Policies
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;
DROP POLICY IF EXISTS "Participants can read deal participants" ON deal_participants;
DROP POLICY IF EXISTS "Users can add participants to deal rooms they're in" ON deal_participants;

-- Create SELECT policy for deal_participants
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Case 1: User is the participant themselves (fast path, no function call)
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer or seller in the match (uses function to avoid recursion)
    is_user_in_match_for_deal_room(deal_room_id, auth.uid())
  );

-- Create INSERT policy for deal_participants
CREATE POLICY "Users can add participants to deal rooms they're in"
  ON deal_participants FOR INSERT
  WITH CHECK (
    -- Case 1: User is inserting themselves
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer/seller in the match (can create participants for both parties)
    can_add_participant_to_deal_room(deal_room_id, auth.uid())
  );

-- ============================================================================
-- PART 4: Conversations Policies
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversations in their deal rooms" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations in their deal rooms" ON conversations;
DROP POLICY IF EXISTS "Participants can create conversations" ON conversations;

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

-- ============================================================================
-- PART 5: Messages Policies
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Participants can read messages" ON messages;
DROP POLICY IF EXISTS "Participants can create messages" ON messages;

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

-- ============================================================================
-- Migration Complete!
-- ============================================================================
