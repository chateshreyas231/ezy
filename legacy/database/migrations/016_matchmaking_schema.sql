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

