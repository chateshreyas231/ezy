-- Migration 008: Final comprehensive fix for all RLS recursion issues
-- This migration ensures ALL policies that could cause recursion are fixed
-- by checking the matches table directly instead of deal_participants

-- ============================================
-- DEAL_ROOMS POLICIES (Fix recursion)
-- ============================================

-- Drop and recreate deal_rooms policy to check matches directly
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;
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

-- ============================================
-- DEAL_PARTICIPANTS POLICIES (Fix recursion)
-- ============================================

-- Drop all existing deal_participants policies
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;
DROP POLICY IF EXISTS "Participants can read deal participants" ON deal_participants;

-- Create a simple, non-recursive policy
-- Users can see participants if:
-- 1. They are the participant themselves (profile_id = auth.uid()), OR
-- 2. They are the buyer or seller in the match (via matches table, NOT deal_participants)
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Case 1: User is the participant themselves
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer or seller in the match (check via matches table, not deal_participants)
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

-- ============================================
-- TASKS POLICIES (Fix recursion)
-- ============================================

-- Drop and recreate tasks policy to check matches directly
DROP POLICY IF EXISTS "Users can view tasks in their deal rooms" ON tasks;
CREATE POLICY "Users can view tasks in their deal rooms"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_rooms dr
      JOIN matches m ON m.id = dr.match_id
      WHERE dr.id = tasks.deal_room_id
      AND (
        m.buyer_id = auth.uid()
        OR m.seller_id = auth.uid()
      )
    )
  );

-- ============================================
-- CONVERSATIONS POLICIES (Fix recursion)
-- ============================================

-- Drop and recreate conversations policy to check matches directly
DROP POLICY IF EXISTS "Users can view conversations in their deal rooms" ON conversations;
CREATE POLICY "Users can view conversations in their deal rooms"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_rooms dr
      JOIN matches m ON m.id = dr.match_id
      WHERE dr.id = conversations.deal_room_id
      AND (
        m.buyer_id = auth.uid()
        OR m.seller_id = auth.uid()
      )
    )
  );

-- ============================================
-- MESSAGES POLICIES (Fix recursion)
-- ============================================

-- Drop and recreate messages policies to check matches directly
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in accessible conversations" ON messages;

CREATE POLICY "Users can view messages in accessible conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations conv
      JOIN deal_rooms dr ON dr.id = conv.deal_room_id
      JOIN matches m ON m.id = dr.match_id
      WHERE conv.id = messages.conversation_id
      AND (
        m.buyer_id = auth.uid()
        OR m.seller_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert messages in accessible conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_profile_id
    AND EXISTS (
      SELECT 1 FROM conversations conv
      JOIN deal_rooms dr ON dr.id = conv.deal_room_id
      JOIN matches m ON m.id = dr.match_id
      WHERE conv.id = messages.conversation_id
      AND (
        m.buyer_id = auth.uid()
        OR m.seller_id = auth.uid()
      )
    )
  );

