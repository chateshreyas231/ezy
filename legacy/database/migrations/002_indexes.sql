-- Performance indexes for Ezriya MVP
-- Optimized for common query patterns

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Buyer Need Posts indexes
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_agent_id ON buyer_need_posts(agent_id);
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_state ON buyer_need_posts(state);
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_city ON buyer_need_posts(city);
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_zip ON buyer_need_posts(zip);
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_price_range ON buyer_need_posts(price_min, price_max);
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_property_type ON buyer_need_posts(property_type);
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_created_at ON buyer_need_posts(created_at DESC);

-- Listing Posts indexes
CREATE INDEX IF NOT EXISTS idx_listing_posts_agent_id ON listing_posts(agent_id);
CREATE INDEX IF NOT EXISTS idx_listing_posts_state ON listing_posts(state);
CREATE INDEX IF NOT EXISTS idx_listing_posts_city ON listing_posts(city);
CREATE INDEX IF NOT EXISTS idx_listing_posts_zip ON listing_posts(zip);
CREATE INDEX IF NOT EXISTS idx_listing_posts_list_price ON listing_posts(list_price);
CREATE INDEX IF NOT EXISTS idx_listing_posts_property_type ON listing_posts(property_type);
CREATE INDEX IF NOT EXISTS idx_listing_posts_created_at ON listing_posts(created_at DESC);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_buyer_need_post_id ON matches(buyer_need_post_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_post_id ON matches(listing_post_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- Match Unlocks indexes
CREATE INDEX IF NOT EXISTS idx_match_unlocks_user_id ON match_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_match_unlocks_buyer_need_post_id ON match_unlocks(buyer_need_post_id);
CREATE INDEX IF NOT EXISTS idx_match_unlocks_listing_post_id ON match_unlocks(listing_post_id);

-- Offer Rooms indexes
CREATE INDEX IF NOT EXISTS idx_offer_rooms_buyer_need_post_id ON offer_rooms(buyer_need_post_id);
CREATE INDEX IF NOT EXISTS idx_offer_rooms_listing_post_id ON offer_rooms(listing_post_id);
CREATE INDEX IF NOT EXISTS idx_offer_rooms_match_id ON offer_rooms(match_id);
CREATE INDEX IF NOT EXISTS idx_offer_rooms_created_at ON offer_rooms(created_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_offer_room_id ON messages(offer_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Intent Entries indexes
CREATE INDEX IF NOT EXISTS idx_intent_entries_offer_room_id ON intent_entries(offer_room_id);
CREATE INDEX IF NOT EXISTS idx_intent_entries_user_id ON intent_entries(user_id);

-- Compensation Declarations indexes
CREATE INDEX IF NOT EXISTS idx_compensation_declarations_offer_room_id ON compensation_declarations(offer_room_id);
CREATE INDEX IF NOT EXISTS idx_compensation_declarations_user_id ON compensation_declarations(user_id);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_creator_id ON appointments(creator_id);
CREATE INDEX IF NOT EXISTS idx_appointments_related_match_id ON appointments(related_match_id);
CREATE INDEX IF NOT EXISTS idx_appointments_offer_room_id ON appointments(offer_room_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_time ON appointments(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_appointments_qr_token ON appointments(qr_token);

-- Check-ins indexes
CREATE INDEX IF NOT EXISTS idx_checkins_appointment_id ON checkins(appointment_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON checkins(checked_in_at DESC);

-- Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_buyer_need_posts_state_city_price ON buyer_need_posts(state, city, price_min, price_max);
CREATE INDEX IF NOT EXISTS idx_listing_posts_state_city_price ON listing_posts(state, city, list_price);

