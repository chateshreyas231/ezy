-- Ezriya Platform - RLS Policies
-- Implements Row-Level Security for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can SELECT their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can UPDATE their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can INSERT their own profile (on signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- BUYER INTENTS POLICIES
-- ============================================

-- Users can SELECT their own buyer intents
DROP POLICY IF EXISTS "Users can view own buyer intents" ON buyer_intents;
CREATE POLICY "Users can view own buyer intents"
  ON buyer_intents FOR SELECT
  USING (auth.uid() = buyer_id);

-- Users can INSERT their own buyer intents
DROP POLICY IF EXISTS "Users can insert own buyer intents" ON buyer_intents;
CREATE POLICY "Users can insert own buyer intents"
  ON buyer_intents FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Users can UPDATE their own buyer intents
DROP POLICY IF EXISTS "Users can update own buyer intents" ON buyer_intents;
CREATE POLICY "Users can update own buyer intents"
  ON buyer_intents FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Users can DELETE their own buyer intents
DROP POLICY IF EXISTS "Users can delete own buyer intents" ON buyer_intents;
CREATE POLICY "Users can delete own buyer intents"
  ON buyer_intents FOR DELETE
  USING (auth.uid() = buyer_id);

-- ============================================
-- LISTINGS POLICIES
-- ============================================

-- Sellers can SELECT/UPDATE their own listings (always)
DROP POLICY IF EXISTS "Sellers can view own listings" ON listings;
CREATE POLICY "Sellers can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can insert own listings" ON listings;
CREATE POLICY "Sellers can insert own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Buyers can SELECT only active, verified listings within freshness window
-- Freshness: 7 days (configurable via constant)
DROP POLICY IF EXISTS "Buyers can view active verified listings" ON listings;
CREATE POLICY "Buyers can view active verified listings"
  ON listings FOR SELECT
  USING (
    status = 'active' 
    AND listing_verified = true 
    AND (
      freshness_verified_at IS NULL 
      OR freshness_verified_at > NOW() - INTERVAL '7 days'
    )
  );

-- Note: address_private is protected - never selectable by non-participants
-- This is enforced at the application level and via views if needed

-- ============================================
-- LISTING MEDIA POLICIES
-- ============================================

-- Anyone can view media for listings they can view
DROP POLICY IF EXISTS "Users can view listing media" ON listing_media;
CREATE POLICY "Users can view listing media"
  ON listing_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND (
        listings.seller_id = auth.uid()
        OR (
          listings.status = 'active'
          AND listings.listing_verified = true
          AND (
            listings.freshness_verified_at IS NULL
            OR listings.freshness_verified_at > NOW() - INTERVAL '7 days'
          )
        )
      )
    )
  );

-- Sellers can manage media for their own listings
DROP POLICY IF EXISTS "Sellers can manage own listing media" ON listing_media;
CREATE POLICY "Sellers can manage own listing media"
  ON listing_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- ============================================
-- SWIPES POLICIES
-- ============================================

-- Users can SELECT only their own swipes
DROP POLICY IF EXISTS "Users can view own swipes" ON swipes;
CREATE POLICY "Users can view own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = actor_id);

-- Users can INSERT their own swipes
DROP POLICY IF EXISTS "Users can insert own swipes" ON swipes;
CREATE POLICY "Users can insert own swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- ============================================
-- MATCHES POLICIES
-- ============================================

-- Users can SELECT matches where they are buyer or seller
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================
-- DEAL ROOMS POLICIES
-- ============================================

-- Users can SELECT deal rooms where they are participants
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_participants.deal_room_id = deal_rooms.id
      AND deal_participants.profile_id = auth.uid()
    )
  );

-- ============================================
-- DEAL PARTICIPANTS POLICIES
-- ============================================

-- Users can SELECT participants in deal rooms they participate in
-- FIX: Avoid infinite recursion by checking matches table instead of deal_participants
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
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
-- TASKS POLICIES
-- ============================================

-- Users can SELECT tasks in deal rooms they participate in
DROP POLICY IF EXISTS "Users can view tasks in their deal rooms" ON tasks;
CREATE POLICY "Users can view tasks in their deal rooms"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_participants.deal_room_id = tasks.deal_room_id
      AND deal_participants.profile_id = auth.uid()
    )
  );

-- Users can UPDATE tasks assigned to them
DROP POLICY IF EXISTS "Users can update assigned tasks" ON tasks;
CREATE POLICY "Users can update assigned tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = assignee_profile_id);

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Users can SELECT conversations in deal rooms they participate in
DROP POLICY IF EXISTS "Users can view conversations in their deal rooms" ON conversations;
CREATE POLICY "Users can view conversations in their deal rooms"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_participants.deal_room_id = conversations.deal_room_id
      AND deal_participants.profile_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can SELECT messages in conversations they can access
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON messages;
CREATE POLICY "Users can view messages in accessible conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN deal_participants ON deal_participants.deal_room_id = conversations.deal_room_id
      WHERE conversations.id = messages.conversation_id
      AND deal_participants.profile_id = auth.uid()
    )
  );

-- Users can INSERT messages in conversations they can access
DROP POLICY IF EXISTS "Users can insert messages in accessible conversations" ON messages;
CREATE POLICY "Users can insert messages in accessible conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_profile_id
    AND EXISTS (
      SELECT 1 FROM conversations
      JOIN deal_participants ON deal_participants.deal_room_id = conversations.deal_room_id
      WHERE conversations.id = messages.conversation_id
      AND deal_participants.profile_id = auth.uid()
    )
  );

