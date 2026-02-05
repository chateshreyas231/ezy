-- Migration 017: RLS Policies for Matchmaking Schema
-- Implements Row-Level Security for all new matchmaking tables

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES RLS POLICIES
-- ============================================================
-- Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Agents can read profiles only for deals they participate in
CREATE POLICY "Agents can read profiles in their deals" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_participants dp
      JOIN deal_rooms dr ON dp.deal_room_id = dr.id
      WHERE dp.profile_id = profiles.id
      AND EXISTS (
        SELECT 1 FROM deal_participants dp2
        WHERE dp2.deal_room_id = dr.id
        AND dp2.profile_id = auth.uid()
        AND dp2.role_in_deal IN ('buyer_agent', 'seller_agent')
      )
    )
  );

-- ============================================================
-- BUYER INTENTS RLS POLICIES
-- ============================================================
-- Only owner (buyer/agent) can manage
CREATE POLICY "Buyers can manage own intents" ON buyer_intents
  FOR ALL USING (buyer_id = auth.uid());

-- Sellers can read ONLY anonymized fields after match (MVP: restrict until match)
-- For now, sellers cannot read buyer intents until match is created
CREATE POLICY "Sellers can read matched buyer intents" ON buyer_intents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.buyer_id = buyer_intents.buyer_id
      AND m.seller_id = auth.uid()
    )
  );

-- ============================================================
-- LISTINGS RLS POLICIES
-- ============================================================
-- Public read only for active listings BUT only show to buyers with verification_level >= 1
CREATE POLICY "Verified buyers can read active listings" ON listings
  FOR SELECT USING (
    status = 'active'
    AND (
      -- Owner can always see their own listings
      seller_id = auth.uid()
      OR (
        -- Others can see if verified
        (listing_verified = TRUE OR EXISTS (
          SELECT verification_level FROM profiles WHERE id = auth.uid() AND verification_level >= 1
        ))
        -- Do not show private address until match
        AND address_private IS NULL
      )
    )
  );

-- Sellers can manage their own listings
CREATE POLICY "Sellers can manage own listings" ON listings
  FOR ALL USING (seller_id = auth.uid());

-- Show private address only to matched buyers
CREATE POLICY "Matched buyers can see private address" ON listings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.listing_id = listings.id
      AND m.buyer_id = auth.uid()
    )
  );

-- ============================================================
-- LISTING MEDIA RLS POLICIES
-- ============================================================
-- Anyone who can read the listing can read its media
CREATE POLICY "Users can read listing media" ON listing_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_media.listing_id
      AND (
        seller_id = auth.uid()
        OR (
          status = 'active'
          AND (listing_verified = TRUE OR EXISTS (
            SELECT verification_level FROM profiles WHERE id = auth.uid() AND verification_level >= 1
          ))
        )
      )
    )
  );

-- Sellers can manage media for their listings
CREATE POLICY "Sellers can manage own listing media" ON listing_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_media.listing_id
      AND seller_id = auth.uid()
    )
  );

-- ============================================================
-- SWIPES RLS POLICIES
-- ============================================================
-- User can insert/read their own swipes
CREATE POLICY "Users can manage own swipes" ON swipes
  FOR ALL USING (actor_id = auth.uid());

-- ============================================================
-- MATCHES RLS POLICIES
-- ============================================================
-- Only participants (buyer, seller, or their agents) can read matches
CREATE POLICY "Participants can read matches" ON matches
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM deal_participants dp
      JOIN deal_rooms dr ON dp.deal_room_id = dr.id
      WHERE dr.match_id = matches.id
      AND dp.profile_id = auth.uid()
    )
  );

-- ============================================================
-- DEAL ROOMS RLS POLICIES
-- ============================================================
-- Only participants can read/write based on deal_participants
CREATE POLICY "Participants can read deal rooms" ON deal_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = deal_rooms.id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update deal rooms" ON deal_rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = deal_rooms.id
      AND profile_id = auth.uid()
    )
  );

-- ============================================================
-- DEAL PARTICIPANTS RLS POLICIES
-- ============================================================
-- Participants can read participants in their deal rooms
CREATE POLICY "Participants can read deal participants" ON deal_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_participants dp2
      WHERE dp2.deal_room_id = deal_participants.deal_room_id
      AND dp2.profile_id = auth.uid()
    )
  );

-- ============================================================
-- TASKS RLS POLICIES (updated for deal_rooms)
-- ============================================================
-- Only participants in the deal room can read/write tasks
DROP POLICY IF EXISTS "Read tasks by role and context" ON tasks;
DROP POLICY IF EXISTS "Insert tasks for own contexts" ON tasks;
DROP POLICY IF EXISTS "Update tasks by role and context" ON tasks;

CREATE POLICY "Participants can read tasks in deal rooms" ON tasks
  FOR SELECT USING (
    deal_room_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = tasks.deal_room_id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create tasks in deal rooms" ON tasks
  FOR INSERT WITH CHECK (
    deal_room_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = tasks.deal_room_id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update tasks in deal rooms" ON tasks
  FOR UPDATE USING (
    deal_room_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = tasks.deal_room_id
      AND profile_id = auth.uid()
    )
  );

-- ============================================================
-- CONVERSATIONS RLS POLICIES (updated for deal_rooms)
-- ============================================================
-- Only participants can read conversations
DROP POLICY IF EXISTS "Agents see verified buyer conversations" ON conversations;
DROP POLICY IF EXISTS "Verified buyers can create conversations" ON conversations;

CREATE POLICY "Participants can read conversations" ON conversations
  FOR SELECT USING (
    deal_room_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = conversations.deal_room_id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    deal_room_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = conversations.deal_room_id
      AND profile_id = auth.uid()
    )
  );

-- ============================================================
-- MESSAGES RLS POLICIES (updated for profiles)
-- ============================================================
-- Only participants can read/write messages
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can read messages" ON messages;

CREATE POLICY "Participants can read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN deal_rooms dr ON c.deal_room_id = dr.id
      WHERE c.id = messages.conversation_id
      AND EXISTS (
        SELECT 1 FROM deal_participants
        WHERE deal_room_id = dr.id
        AND profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Participants can create messages" ON messages
  FOR INSERT WITH CHECK (
    sender_profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN deal_rooms dr ON c.deal_room_id = dr.id
      WHERE c.id = messages.conversation_id
      AND EXISTS (
        SELECT 1 FROM deal_participants
        WHERE deal_room_id = dr.id
        AND profile_id = auth.uid()
      )
    )
  );

