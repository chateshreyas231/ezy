-- ============================================================
-- STEP-BY-STEP MATCHMAKING MIGRATION
-- Run each section separately, or run all at once
-- ============================================================

-- ============================================================
-- STEP 1: CREATE NEW TABLES (No dependencies)
-- ============================================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'support')),
  display_name TEXT,
  verification_level INTEGER NOT NULL DEFAULT 0 CHECK (verification_level >= 0 AND verification_level <= 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BUYER INTENTS TABLE
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

-- LISTINGS TABLE
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

-- LISTING MEDIA TABLE
CREATE TABLE IF NOT EXISTS listing_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SWIPES TABLE
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'buyer_intent')),
  target_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('yes', 'no')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(actor_id, target_type, target_id)
);

-- MATCHES TABLE (NEW SCHEMA - may conflict with old one)
-- Check if old matches table exists and has different structure
DO $$
BEGIN
  -- If old matches table exists with old columns, we'll create a new one with different name
  -- But for now, let's just create the new one
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'matches'
  ) THEN
    CREATE TABLE matches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      match_score NUMERIC(5, 2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(listing_id, buyer_id)
    );
  ELSE
    -- Old table exists - check if it has the new columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'matches' AND column_name = 'buyer_id'
    ) THEN
      -- Add new columns to existing table
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_score NUMERIC(5, 2);
    END IF;
  END IF;
END $$;

-- DEAL ROOMS TABLE
CREATE TABLE IF NOT EXISTS deal_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'matched' CHECK (status IN ('matched', 'touring', 'offer_made', 'under_contract', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DEAL PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS deal_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_deal TEXT NOT NULL CHECK (role_in_deal IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'lawyer', 'inspector', 'lender', 'title')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_room_id, profile_id)
);

-- ============================================================
-- STEP 2: CREATE INDEXES
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
CREATE INDEX IF NOT EXISTS idx_matches_buyer_id ON matches(buyer_id) WHERE buyer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_seller_id ON matches(seller_id) WHERE seller_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON matches(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deal_rooms_match_id ON deal_rooms(match_id);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_status ON deal_rooms(status);
CREATE INDEX IF NOT EXISTS idx_deal_participants_deal_room_id ON deal_participants(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_profile_id ON deal_participants(profile_id);

-- ============================================================
-- STEP 3: CREATE TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- STEP 4: CREATE TRIGGERS
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
-- STEP 5: UPDATE EXISTING TABLES (if they exist)
-- ============================================================

-- Update tasks table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE;
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update conversations table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'conversations'
  ) THEN
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update messages table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'messages'
  ) THEN
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- STEP 6: ENABLE RLS
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
-- STEP 7: CREATE RLS POLICIES
-- ============================================================

-- PROFILES POLICIES
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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

-- BUYER INTENTS POLICIES
CREATE POLICY "Buyers can manage own intents" ON buyer_intents
  FOR ALL USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can read matched buyer intents" ON buyer_intents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.buyer_id = buyer_intents.buyer_id
      AND m.seller_id = auth.uid()
    )
  );

-- LISTINGS POLICIES
CREATE POLICY "Verified buyers can read active listings" ON listings
  FOR SELECT USING (
    status = 'active'
    AND (
      seller_id = auth.uid()
      OR (
        (listing_verified = TRUE OR EXISTS (
          SELECT verification_level FROM profiles WHERE id = auth.uid() AND verification_level >= 1
        ))
        AND address_private IS NULL
      )
    )
  );

CREATE POLICY "Sellers can manage own listings" ON listings
  FOR ALL USING (seller_id = auth.uid());

CREATE POLICY "Matched buyers can see private address" ON listings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.listing_id = listings.id
      AND m.buyer_id = auth.uid()
    )
  );

-- LISTING MEDIA POLICIES
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

CREATE POLICY "Sellers can manage own listing media" ON listing_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_media.listing_id
      AND seller_id = auth.uid()
    )
  );

-- SWIPES POLICIES
CREATE POLICY "Users can manage own swipes" ON swipes
  FOR ALL USING (actor_id = auth.uid());

-- MATCHES POLICIES (only if buyer_id column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'buyer_id'
  ) THEN
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
  END IF;
END $$;

-- DEAL ROOMS POLICIES
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

-- DEAL PARTICIPANTS POLICIES
CREATE POLICY "Participants can read deal participants" ON deal_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_participants dp2
      WHERE dp2.deal_room_id = deal_participants.deal_room_id
      AND dp2.profile_id = auth.uid()
    )
  );

-- TASKS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    
    BEGIN
      CREATE POLICY "Participants can read tasks in deal rooms" ON tasks
        FOR SELECT USING (
          deal_room_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM deal_participants
            WHERE deal_room_id = tasks.deal_room_id
            AND profile_id = auth.uid()
          )
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
      CREATE POLICY "Participants can create tasks in deal rooms" ON tasks
        FOR INSERT WITH CHECK (
          deal_room_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM deal_participants
            WHERE deal_room_id = tasks.deal_room_id
            AND profile_id = auth.uid()
          )
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
      CREATE POLICY "Participants can update tasks in deal rooms" ON tasks
        FOR UPDATE USING (
          deal_room_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM deal_participants
            WHERE deal_room_id = tasks.deal_room_id
            AND profile_id = auth.uid()
          )
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- CONVERSATIONS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'conversations'
  ) THEN
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
    
    BEGIN
      CREATE POLICY "Participants can read conversations" ON conversations
        FOR SELECT USING (
          deal_room_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM deal_participants
            WHERE deal_room_id = conversations.deal_room_id
            AND profile_id = auth.uid()
          )
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
      CREATE POLICY "Participants can create conversations" ON conversations
        FOR INSERT WITH CHECK (
          deal_room_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM deal_participants
            WHERE deal_room_id = conversations.deal_room_id
            AND profile_id = auth.uid()
          )
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- MESSAGES POLICIES (if table exists AND conversations table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'messages'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'conversations'
  ) THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    
    -- Check if messages table has conversation_id column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'messages' AND column_name = 'conversation_id'
    ) THEN
      BEGIN
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
      EXCEPTION WHEN duplicate_object THEN NULL; END;
      
      BEGIN
        CREATE POLICY "Participants can create messages" ON messages
          FOR INSERT WITH CHECK (
            (sender_profile_id = auth.uid() OR sender_id = auth.uid())
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
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
  END IF;
END $$;

