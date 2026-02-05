-- Migration 007: Fix remaining policies that query deal_participants
-- These policies also cause recursion when they query deal_participants
-- Solution: Check matches table via deal_rooms instead

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Drop the problematic tasks policy
DROP POLICY IF EXISTS "Users can view tasks in their deal rooms" ON tasks;

-- Create a new policy that checks matches table instead
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
-- CONVERSATIONS POLICIES
-- ============================================

-- Drop the problematic conversations policy
DROP POLICY IF EXISTS "Users can view conversations in their deal rooms" ON conversations;

-- Create a new policy that checks matches table instead
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
-- MESSAGES POLICIES
-- ============================================

-- Drop the problematic messages policies
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in accessible conversations" ON messages;

-- Create new policies that check matches table instead
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

