-- Row Level Security (RLS) Policies for Ezriya MVP
-- Enforces data access based on user roles and relationships

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_need_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensation_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can read other users' basic info (for contact purposes)
CREATE POLICY "Users can read other users basic info" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Buyer Need Posts policies
-- Users can create buyer need posts
CREATE POLICY "Users can create buyer need posts" ON buyer_need_posts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- Users can read their own buyer need posts
CREATE POLICY "Users can read own buyer need posts" ON buyer_need_posts
  FOR SELECT USING (auth.uid() = agent_id);

-- Users can read buyer need posts in their state (for matching)
CREATE POLICY "Users can read buyer need posts in state" ON buyer_need_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND state = buyer_need_posts.state
    )
  );

-- Users can update their own buyer need posts
CREATE POLICY "Users can update own buyer need posts" ON buyer_need_posts
  FOR UPDATE USING (auth.uid() = agent_id);

-- Users can delete their own buyer need posts
CREATE POLICY "Users can delete own buyer need posts" ON buyer_need_posts
  FOR DELETE USING (auth.uid() = agent_id);

-- Listing Posts policies
-- Users can create listing posts
CREATE POLICY "Users can create listing posts" ON listing_posts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- Users can read their own listing posts
CREATE POLICY "Users can read own listing posts" ON listing_posts
  FOR SELECT USING (auth.uid() = agent_id);

-- Users can read listing posts in their state (for matching)
CREATE POLICY "Users can read listing posts in state" ON listing_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND state = listing_posts.state
    )
  );

-- Users can update their own listing posts
CREATE POLICY "Users can update own listing posts" ON listing_posts
  FOR UPDATE USING (auth.uid() = agent_id);

-- Users can delete their own listing posts
CREATE POLICY "Users can delete own listing posts" ON listing_posts
  FOR DELETE USING (auth.uid() = agent_id);

-- Matches policies
-- Users can read matches for their buyer need posts
CREATE POLICY "Users can read matches for own buyer need posts" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM buyer_need_posts 
      WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid()
    )
  );

-- Users can read matches for their listing posts
CREATE POLICY "Users can read matches for own listing posts" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listing_posts 
      WHERE id = matches.listing_post_id AND agent_id = auth.uid()
    )
  );

-- Match Unlocks policies
-- Users can create their own unlocks
CREATE POLICY "Users can create own match unlocks" ON match_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own unlocks
CREATE POLICY "Users can read own match unlocks" ON match_unlocks
  FOR SELECT USING (auth.uid() = user_id);

-- Offer Rooms policies
-- Users can create offer rooms for their matches
CREATE POLICY "Users can create offer rooms" ON offer_rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE id = offer_rooms.match_id 
      AND (
        EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
      )
    )
  );

-- Users can read offer rooms they're part of
CREATE POLICY "Users can read offer rooms" ON offer_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE id = offer_rooms.match_id 
      AND (
        EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
      )
    )
  );

-- Messages policies
-- Users can create messages in offer rooms they're part of
CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM offer_rooms 
      WHERE id = messages.offer_room_id
      AND (
        EXISTS (
          SELECT 1 FROM matches 
          WHERE id = offer_rooms.match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Users can read messages in offer rooms they're part of
CREATE POLICY "Users can read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offer_rooms 
      WHERE id = messages.offer_room_id
      AND (
        EXISTS (
          SELECT 1 FROM matches 
          WHERE id = offer_rooms.match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Intent Entries policies
-- Users can create intent entries in offer rooms they're part of
CREATE POLICY "Users can create intent entries" ON intent_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM offer_rooms 
      WHERE id = intent_entries.offer_room_id
      AND (
        EXISTS (
          SELECT 1 FROM matches 
          WHERE id = offer_rooms.match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Users can read intent entries in offer rooms they're part of
CREATE POLICY "Users can read intent entries" ON intent_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offer_rooms 
      WHERE id = intent_entries.offer_room_id
      AND (
        EXISTS (
          SELECT 1 FROM matches 
          WHERE id = offer_rooms.match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Compensation Declarations policies
-- Users can create compensation declarations in offer rooms they're part of
CREATE POLICY "Users can create compensation declarations" ON compensation_declarations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM offer_rooms 
      WHERE id = compensation_declarations.offer_room_id
      AND (
        EXISTS (
          SELECT 1 FROM matches 
          WHERE id = offer_rooms.match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Users can read compensation declarations in offer rooms they're part of
CREATE POLICY "Users can read compensation declarations" ON compensation_declarations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offer_rooms 
      WHERE id = compensation_declarations.offer_room_id
      AND (
        EXISTS (
          SELECT 1 FROM matches 
          WHERE id = offer_rooms.match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Appointments policies
-- Users can create appointments
CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Users can read appointments they created or are participants in
CREATE POLICY "Users can read appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1 FROM matches 
      WHERE id = appointments.related_match_id 
      AND (
        EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
      )
    )
  );

-- Users can update appointments they created
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = creator_id);

-- Check-ins policies
-- Users can create check-ins for appointments they're part of
CREATE POLICY "Users can create check-ins" ON checkins
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = checkins.appointment_id
      AND (
        creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM matches 
          WHERE id = appointments.related_match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Users can read check-ins for appointments they're part of
CREATE POLICY "Users can read check-ins" ON checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = checkins.appointment_id
      AND (
        creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM matches 
          WHERE id = appointments.related_match_id 
          AND (
            EXISTS (SELECT 1 FROM buyer_need_posts WHERE id = matches.buyer_need_post_id AND agent_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM listing_posts WHERE id = matches.listing_post_id AND agent_id = auth.uid())
          )
        )
      )
    )
  );

-- Activity Logs policies
-- Users can read their own activity logs
CREATE POLICY "Users can read own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- System can create activity logs (via service role)
-- Note: Service role inserts bypass RLS, so no policy needed for INSERT

