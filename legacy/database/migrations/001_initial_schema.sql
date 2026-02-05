-- Ezriya MVP Database Schema
-- Postgres-first design for portability

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'buyer',
  state TEXT,
  is_verified_agent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer Need Posts (agent posting on behalf of buyer)
CREATE TABLE IF NOT EXISTS buyer_need_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  city TEXT,
  zip TEXT,
  radius_miles INTEGER,
  price_min DECIMAL(12, 2),
  price_max DECIMAL(12, 2),
  property_type TEXT,
  beds INTEGER,
  baths DECIMAL(3, 1),
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Posts (agent posting property for seller)
CREATE TABLE IF NOT EXISTS listing_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  address TEXT,
  city TEXT,
  zip TEXT,
  list_price DECIMAL(12, 2) NOT NULL,
  property_type TEXT,
  beds INTEGER,
  baths DECIMAL(3, 1),
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches (bilateral: buyer need ↔ listing)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_need_post_id UUID NOT NULL REFERENCES buyer_need_posts(id) ON DELETE CASCADE,
  listing_post_id UUID NOT NULL REFERENCES listing_posts(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_need_post_id, listing_post_id)
);

-- Match Unlocks (flat-fee unlock records)
CREATE TABLE IF NOT EXISTS match_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_need_post_id UUID NOT NULL REFERENCES buyer_need_posts(id) ON DELETE CASCADE,
  listing_post_id UUID NOT NULL REFERENCES listing_posts(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, buyer_need_post_id, listing_post_id)
);

-- Offer Rooms (communication space for matches)
CREATE TABLE IF NOT EXISTS offer_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_need_post_id UUID REFERENCES buyer_need_posts(id) ON DELETE CASCADE,
  listing_post_id UUID REFERENCES listing_posts(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (in offer rooms)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_room_id UUID NOT NULL REFERENCES offer_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intent Entries (non-binding intent declarations)
CREATE TABLE IF NOT EXISTS intent_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_room_id UUID NOT NULL REFERENCES offer_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intent_text TEXT,
  offer_amount DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compensation Declarations
CREATE TABLE IF NOT EXISTS compensation_declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_room_id UUID NOT NULL REFERENCES offer_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (scheduling)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  related_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  offer_room_id UUID REFERENCES offer_rooms(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  qr_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins (QR-based verification)
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  location_snapshot JSONB,
  UNIQUE(appointment_id, user_id)
);

-- Activity Logs (compliance audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_need_posts_updated_at BEFORE UPDATE ON buyer_need_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_posts_updated_at BEFORE UPDATE ON listing_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_rooms_updated_at BEFORE UPDATE ON offer_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

