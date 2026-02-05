-- Combined Matchmaking Migrations
-- Apply this entire file in Supabase SQL Editor
-- Generated: Mon Jan  5 03:00:12 CST 2026

-- ============================================================
-- MIGRATION 016: Matchmaking Schema
-- ============================================================
-- Migration 016: Matchmaking Schema (Tinder/TikTok Style)
-- Creates new tables for swipe-based real estate matchmaking
-- This is a major refactor - new schema for matchmaking MVP

-- ============================================================
-- PROFILES TABLE (replaces/enhances users table)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'support')),
  display_name TEXT,
  verification_level INTEGER NOT NULL DEFAULT 0 CHECK (verification_level >= 0 AND verification_level <= 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUYER INTENTS TABLE (replaces buyer_need_posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS buyer_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  budget_min INTEGER,
  budget_max INTEGER,
  beds_min INTEGER,
  baths_min INTEGER,
  property_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  must_haves TEXT[] DEFAULT ARRAY[]::TEXT[],
  dealbreakers TEXT[] DEFAULT ARRAY[]::TEXT[],
  areas JSONB DEFAULT '{}'::jsonb,
  commute_anchors JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LISTINGS TABLE (enhanced from listing_posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address_public TEXT,
  address_private TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  price INTEGER NOT NULL,
  beds INTEGER,
  baths INTEGER,
  sqft INTEGER,
  property_type TEXT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'pending', 'sold', 'inactive')),
  freshness_verified_at TIMESTAMPTZ,
  listing_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LISTING MEDIA TABLE (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SWIPES TABLE (new - core of matchmaking)
-- ============================================================
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'buyer_intent')),
  target_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('yes', 'no')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(actor_id, target_type, target_id)
);

-- ============================================================
-- MATCHES TABLE (enhanced)
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

-- ============================================================
-- DEAL ROOMS TABLE (new structure)
-- ============================================================
CREATE TABLE IF NOT EXISTS deal_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'matched' CHECK (status IN ('matched', 'touring', 'offer_made', 'under_contract', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEAL PARTICIPANTS TABLE (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS deal_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_deal TEXT NOT NULL CHECK (role_in_deal IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'lawyer', 'inspector', 'lender', 'title')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_room_id, profile_id)
);

-- ============================================================
-- UPDATE TASKS TABLE (reference deal_rooms)
-- ============================================================
-- Note: tasks table already exists, we'll add deal_room_id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'deal_room_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update tasks to use assignee_profile_id instead of assigned_role if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'assignee_profile_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN assignee_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update tasks status enum if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'status'
    AND data_type = 'USER-DEFINED'
    AND udt_name = 'task_status_enum'
  ) THEN
    -- Create enum if it doesn't exist
    CREATE TYPE task_status_enum AS ENUM ('todo', 'doing', 'done');
    -- Alter column if it exists as text
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'status'
    ) THEN
      ALTER TABLE tasks ALTER COLUMN status TYPE task_status_enum USING status::task_status_enum;
    END IF;
  END IF;
END $$;

-- ============================================================
-- UPDATE CONVERSATIONS TABLE (reference deal_rooms)
-- ============================================================
-- Note: conversations table already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'deal_room_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- UPDATE MESSAGES TABLE (reference profiles)
-- ============================================================
-- Note: messages table already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'sender_profile_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN sender_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_buyer_intents_buyer_id ON buyer_intents(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_intents_active ON buyer_intents(active) WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_verified ON listings(listing_verified) WHERE listing_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON listing_media(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_order ON listing_media(listing_id, order_index);

CREATE INDEX IF NOT EXISTS idx_swipes_actor_id ON swipes(actor_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_swipes_direction ON swipes(direction) WHERE direction = 'yes';

CREATE INDEX IF NOT EXISTS idx_matches_buyer_id ON matches(buyer_id);
CREATE INDEX IF NOT EXISTS idx_matches_seller_id ON matches(seller_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON matches(listing_id);

CREATE INDEX IF NOT EXISTS idx_deal_rooms_match_id ON deal_rooms(match_id);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_status ON deal_rooms(status);

CREATE INDEX IF NOT EXISTS idx_deal_participants_deal_room_id ON deal_participants(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_profile_id ON deal_participants(profile_id);

CREATE INDEX IF NOT EXISTS idx_tasks_deal_room_id ON tasks(deal_room_id) WHERE deal_room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_profile_id ON tasks(assignee_profile_id) WHERE assignee_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_deal_room_id ON conversations(deal_room_id) WHERE deal_room_id IS NOT NULL;

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_intents_updated_at BEFORE UPDATE ON buyer_intents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_rooms_updated_at BEFORE UPDATE ON deal_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- MIGRATION 017: RLS Policies
-- ============================================================
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


-- ============================================================
-- MIGRATION 018: Migrate Existing Data (OPTIONAL)
-- ============================================================
-- Only run this if you have existing data in old schema
-- Uncomment below to run:
--
-- -- Migration 018: Migrate Existing Data to New Schema
-- -- Migrates data from old tables (users, buyer_need_posts, listing_posts) to new schema
-- 
-- -- ============================================================
-- -- MIGRATE USERS TO PROFILES
-- -- ============================================================
-- INSERT INTO profiles (id, role, display_name, verification_level, created_at, updated_at)
-- SELECT 
--   id,
--   CASE 
--     WHEN role IN ('buyerAgent', 'listingAgent', 'selfRepresentedAgent', 'teamLead') THEN 'buyer_agent'
--     WHEN role = 'fsboSeller' THEN 'seller'
--     WHEN role = 'vendor' THEN 'seller'
--     WHEN role = 'vendorAttorney' THEN 'support'
--     WHEN role = 'admin' THEN 'support'
--     ELSE role
--   END::TEXT as role,
--   name as display_name,
--   COALESCE(verification_level, 0) as verification_level,
--   created_at,
--   updated_at
-- FROM users
-- ON CONFLICT (id) DO UPDATE SET
--   role = EXCLUDED.role,
--   display_name = EXCLUDED.display_name,
--   verification_level = EXCLUDED.verification_level,
--   updated_at = EXCLUDED.updated_at;
-- 
-- -- ============================================================
-- -- MIGRATE BUYER NEED POSTS TO BUYER INTENTS
-- -- ============================================================
-- -- Note: This is a simplified migration - buyer_need_posts structure is different
-- -- We'll create basic buyer_intents from existing buyer_need_posts
-- INSERT INTO buyer_intents (
--   id,
--   buyer_id,
--   budget_min,
--   budget_max,
--   beds_min,
--   baths_min,
--   property_types,
--   active,
--   created_at,
--   updated_at
-- )
-- SELECT 
--   id,
--   agent_id as buyer_id, -- Note: agent_id in old schema becomes buyer_id
--   price_min::INTEGER as budget_min,
--   price_max::INTEGER as budget_max,
--   beds as beds_min,
--   baths::INTEGER as baths_min,
--   CASE 
--     WHEN property_type IS NOT NULL THEN ARRAY[property_type]
--     ELSE ARRAY[]::TEXT[]
--   END as property_types,
--   TRUE as active,
--   created_at,
--   updated_at
-- FROM buyer_need_posts
-- ON CONFLICT (id) DO NOTHING;
-- 
-- -- ============================================================
-- -- MIGRATE LISTING POSTS TO LISTINGS
-- -- ============================================================
-- INSERT INTO listings (
--   id,
--   seller_id,
--   title,
--   description,
--   address_public,
--   address_private,
--   price,
--   beds,
--   baths,
--   property_type,
--   features,
--   status,
--   listing_verified,
--   freshness_verified_at,
--   created_at,
--   updated_at
-- )
-- SELECT 
--   id,
--   agent_id as seller_id,
--   COALESCE(address, city || ', ' || state, 'Property Listing') as title,
--   NULL as description,
--   address as address_public,
--   address as address_private, -- Will be hidden by RLS until match
--   list_price::INTEGER as price,
--   beds,
--   baths::INTEGER as baths,
--   property_type,
--   features,
--   CASE 
--     WHEN listing_status = 'live' THEN 'active'
--     WHEN listing_status = 'under_contract' THEN 'pending'
--     WHEN listing_status = 'sold' THEN 'sold'
--     WHEN listing_status = 'stale' THEN 'inactive'
--     ELSE 'draft'
--   END::TEXT as status,
--   COALESCE(verified, FALSE) as listing_verified,
--   last_verified_at as freshness_verified_at,
--   created_at,
--   updated_at
-- FROM listing_posts
-- ON CONFLICT (id) DO NOTHING;
-- 
-- -- ============================================================
-- -- MIGRATE EXISTING MATCHES
-- -- ============================================================
-- -- Update matches table to include seller_id from listing
-- INSERT INTO matches (id, listing_id, buyer_id, seller_id, match_score, created_at)
-- SELECT 
--   m.id,
--   m.listing_post_id as listing_id,
--   bn.agent_id as buyer_id, -- buyer from buyer_need_post
--   lp.agent_id as seller_id, -- seller from listing_post
--   COALESCE(m.score, 0)::NUMERIC(5, 2) as match_score,
--   m.created_at
-- FROM matches m
-- JOIN buyer_need_posts bn ON m.buyer_need_post_id = bn.id
-- JOIN listing_posts lp ON m.listing_post_id = lp.id
-- ON CONFLICT (id) DO NOTHING;
-- 
-- -- ============================================================
-- -- CREATE DEAL ROOMS FROM EXISTING OFFER ROOMS
-- -- ============================================================
-- INSERT INTO deal_rooms (id, match_id, status, created_at, updated_at)
-- SELECT 
--   or_room.id,
--   or_room.match_id,
--   'matched'::TEXT as status,
--   or_room.created_at,
--   or_room.created_at as updated_at
-- FROM offer_rooms or_room
-- WHERE or_room.match_id IS NOT NULL
-- ON CONFLICT (id) DO NOTHING;
-- 
-- -- ============================================================
-- -- CREATE DEAL PARTICIPANTS FROM MATCHES
-- -- ============================================================
-- INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal, created_at)
-- SELECT DISTINCT
--   dr.id as deal_room_id,
--   m.buyer_id as profile_id,
--   'buyer'::TEXT as role_in_deal,
--   NOW() as created_at
-- FROM deal_rooms dr
-- JOIN matches m ON dr.match_id = m.id
-- ON CONFLICT (deal_room_id, profile_id) DO NOTHING;
-- 
-- INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal, created_at)
-- SELECT DISTINCT
--   dr.id as deal_room_id,
--   m.seller_id as profile_id,
--   'seller'::TEXT as role_in_deal,
--   NOW() as created_at
-- FROM deal_rooms dr
-- JOIN matches m ON dr.match_id = m.id
-- ON CONFLICT (deal_room_id, profile_id) DO NOTHING;
-- 
-- -- ============================================================
-- -- UPDATE CONVERSATIONS TO REFERENCE DEAL ROOMS
-- -- ============================================================
-- UPDATE conversations c
-- SET deal_room_id = dr.id
-- FROM deal_rooms dr
-- JOIN matches m ON dr.match_id = m.id
-- WHERE c.listing_post_id = m.listing_id
-- AND c.buyer_id = m.buyer_id
-- AND c.deal_room_id IS NULL;
-- 
-- -- ============================================================
-- -- UPDATE MESSAGES TO USE SENDER_PROFILE_ID
-- -- ============================================================
-- UPDATE messages msg
-- SET sender_profile_id = msg.sender_id::UUID
-- WHERE sender_profile_id IS NULL
-- AND sender_id IS NOT NULL;
-- 
-- -- ============================================================
-- -- UPDATE TASKS TO REFERENCE DEAL ROOMS
-- -- ============================================================
-- UPDATE tasks t
-- SET deal_room_id = dr.id,
--     assignee_profile_id = (
--       SELECT profile_id FROM deal_participants dp
--       WHERE dp.deal_room_id = dr.id
--       AND dp.role_in_deal = t.assigned_role
--       LIMIT 1
--     )
-- FROM deal_rooms dr
-- JOIN matches m ON dr.match_id = m.id
-- WHERE t.offer_room_id IS NOT NULL
-- AND t.deal_room_id IS NULL
-- AND EXISTS (
--   SELECT 1 FROM offer_rooms or_room
--   WHERE or_room.id = t.offer_room_id
--   AND or_room.match_id = m.id
-- );
-- 
