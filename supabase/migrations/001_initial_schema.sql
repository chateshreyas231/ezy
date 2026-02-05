-- Ezriya Platform - Initial Schema Migration
-- Creates all core tables for the matchmaking platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'support')) DEFAULT 'buyer',
  display_name TEXT,
  verification_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Buyer Intents table
CREATE TABLE IF NOT EXISTS buyer_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  budget_min INTEGER,
  budget_max INTEGER,
  beds_min INTEGER,
  baths_min INTEGER,
  property_types TEXT[],
  must_haves TEXT[],
  dealbreakers TEXT[],
  areas JSONB DEFAULT '[]'::jsonb,
  commute_anchors JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address_public TEXT,
  address_private TEXT,
  price INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  baths INTEGER NOT NULL,
  sqft INTEGER,
  property_type TEXT NOT NULL,
  features TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'pending', 'sold', 'inactive')) DEFAULT 'draft',
  listing_verified BOOLEAN NOT NULL DEFAULT false,
  freshness_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Listing Media table
CREATE TABLE IF NOT EXISTS listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'buyer_intent')),
  target_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('yes', 'no')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(actor_id, target_type, target_id)
);

-- 6. Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score NUMERIC,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

-- 7. Deal Rooms table
CREATE TABLE IF NOT EXISTS deal_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('matched', 'touring', 'offer_made', 'under_contract', 'closed', 'cancelled')) DEFAULT 'matched',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Deal Participants table
CREATE TABLE IF NOT EXISTS deal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_deal TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_room_id, profile_id)
);

-- 9. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  assignee_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'doing', 'done')) DEFAULT 'todo',
  due_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_room_id)
);

-- 11. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fix: Add conversation_id column if messages table exists without it (for existing databases)
-- This MUST run before any index creation on messages table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'conversation_id') THEN
      -- Add column as nullable first to avoid constraint issues
      ALTER TABLE messages ADD COLUMN conversation_id UUID;
      -- Add foreign key constraint if conversations table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
        -- Check if constraint already exists
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'messages_conversation_id_fkey' 
          AND table_schema = 'public' 
          AND table_name = 'messages'
        ) THEN
          ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey 
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
        END IF;
      END IF;
    END IF;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_buyer_intents_buyer_id ON buyer_intents(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_intents_active ON buyer_intents(active);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_verified ON listings(listing_verified, freshness_verified_at);
CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON listing_media(listing_id);
CREATE INDEX IF NOT EXISTS idx_swipes_actor_id ON swipes(actor_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_matches_buyer_id ON matches(buyer_id);
CREATE INDEX IF NOT EXISTS idx_matches_seller_id ON matches(seller_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_match_id ON deal_rooms(match_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_deal_room_id ON deal_participants(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_profile_id ON deal_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_room_id ON tasks(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_deal_room_id ON conversations(deal_room_id);
-- Only create index if conversation_id column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'conversation_id') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

