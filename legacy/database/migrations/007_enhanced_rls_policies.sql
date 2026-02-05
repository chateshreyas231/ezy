-- Migration 007: Enhanced RLS Policies
-- Updates RLS policies for verification enforcement and new tables

-- Update appointments policy to require verification_level >= 2
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
CREATE POLICY "Verified buyers can create appointments" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id 
    AND (SELECT verification_level FROM users WHERE id = auth.uid()) >= 2
  );

-- Update listing posts policy to show only verified listings to non-owners
DROP POLICY IF EXISTS "Users can read listing posts in state" ON listing_posts;
CREATE POLICY "Users can read verified listings in state" ON listing_posts
  FOR SELECT USING (
    -- Listing owner can always see their own listings
    auth.uid() = agent_id
    OR (
      -- Others can only see verified listings in their state
      verified = TRUE
      AND EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND state = listing_posts.state
      )
    )
  );

-- Tasks RLS Policies
-- Users can read tasks assigned to their role in contexts they're part of
CREATE POLICY "Read own role tasks" ON tasks
  FOR SELECT USING (
    -- Task role must match user's role
    (SELECT role FROM users WHERE id = auth.uid()) = tasks.role
    AND (
      -- If task is tied to a deal (offer_room)
      (offer_room_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM offer_rooms 
          JOIN matches ON offer_rooms.match_id = matches.id
          WHERE offer_rooms.id = tasks.offer_room_id
            AND (
              -- buyer's agent or listing agent in that match
              EXISTS (
                SELECT 1 FROM buyer_need_posts 
                WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid()
              )
              OR EXISTS (
                SELECT 1 FROM listing_posts 
                WHERE id = matches.listing_post_id AND agent_id = auth.uid()
              )
            )
        )
      )
      OR 
      -- If task is tied to a listing (pre-deal) and user is the listing owner
      (listing_post_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM listing_posts 
          WHERE id = tasks.listing_post_id 
            AND agent_id = auth.uid()
        )
      )
    )
  );

-- Users can insert tasks for contexts they're part of
CREATE POLICY "Insert tasks for own contexts" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      (listing_post_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM listing_posts 
          WHERE id = tasks.listing_post_id 
            AND agent_id = auth.uid()
        )
      )
      OR
      (offer_room_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM offer_rooms 
          JOIN matches ON offer_rooms.match_id = matches.id
          WHERE offer_rooms.id = tasks.offer_room_id
            AND (
              EXISTS (
                SELECT 1 FROM buyer_need_posts 
                WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid()
              )
              OR EXISTS (
                SELECT 1 FROM listing_posts 
                WHERE id = matches.listing_post_id AND agent_id = auth.uid()
              )
            )
        )
      )
    )
  );

-- Users can update tasks assigned to their role
CREATE POLICY "Update own role tasks" ON tasks
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = tasks.role
    AND (
      (offer_room_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM offer_rooms 
          JOIN matches ON offer_rooms.match_id = matches.id
          WHERE offer_rooms.id = tasks.offer_room_id
            AND (
              EXISTS (
                SELECT 1 FROM buyer_need_posts 
                WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid()
              )
              OR EXISTS (
                SELECT 1 FROM listing_posts 
                WHERE id = matches.listing_post_id AND agent_id = auth.uid()
              )
            )
        )
      )
      OR 
      (listing_post_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM listing_posts 
          WHERE id = tasks.listing_post_id 
            AND agent_id = auth.uid()
        )
      )
    )
  );

-- Conversations RLS Policies
-- Verified buyers can create conversations
CREATE POLICY "Verified buyer can create conversation" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND (SELECT verification_level FROM users WHERE id = auth.uid()) >= 2
  );

-- Agents can read conversations for their listings, buyers can read their own
CREATE POLICY "Agent can read own listing conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listing_posts 
      WHERE id = conversations.listing_post_id 
        AND agent_id = auth.uid()
    )
    OR auth.uid() = conversations.buyer_id
  );

-- Conversation Messages RLS Policies
-- Participants can read conversation messages
CREATE POLICY "Participants can read conversation messages" ON conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_messages.conversation_id
        AND (
          buyer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM listing_posts 
            WHERE id = conversations.listing_post_id 
              AND agent_id = auth.uid()
          )
        )
    )
  );

-- Participants can send messages
CREATE POLICY "Participants can send messages" ON conversation_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_messages.conversation_id
        AND (
          buyer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM listing_posts 
            WHERE id = conversations.listing_post_id 
              AND agent_id = auth.uid()
          )
        )
    )
  );

-- Update match_unlocks to require verification
DROP POLICY IF EXISTS "Users can create own match unlocks" ON match_unlocks;
CREATE POLICY "Verified users can create match unlocks" ON match_unlocks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (SELECT verification_level FROM users WHERE id = auth.uid()) >= 2
  );

