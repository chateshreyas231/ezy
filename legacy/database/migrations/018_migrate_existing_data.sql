-- Migration 018: Migrate Existing Data to New Schema
-- Migrates data from old tables (users, buyer_need_posts, listing_posts) to new schema

-- ============================================================
-- MIGRATE USERS TO PROFILES
-- ============================================================
INSERT INTO profiles (id, role, display_name, verification_level, created_at, updated_at)
SELECT 
  id,
  CASE 
    WHEN role IN ('buyerAgent', 'listingAgent', 'selfRepresentedAgent', 'teamLead') THEN 'buyer_agent'
    WHEN role = 'fsboSeller' THEN 'seller'
    WHEN role = 'vendor' THEN 'seller'
    WHEN role = 'vendorAttorney' THEN 'support'
    WHEN role = 'admin' THEN 'support'
    ELSE role
  END::TEXT as role,
  name as display_name,
  COALESCE(verification_level, 0) as verification_level,
  created_at,
  updated_at
FROM users
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  verification_level = EXCLUDED.verification_level,
  updated_at = EXCLUDED.updated_at;

-- ============================================================
-- MIGRATE BUYER NEED POSTS TO BUYER INTENTS
-- ============================================================
-- Note: This is a simplified migration - buyer_need_posts structure is different
-- We'll create basic buyer_intents from existing buyer_need_posts
INSERT INTO buyer_intents (
  id,
  buyer_id,
  budget_min,
  budget_max,
  beds_min,
  baths_min,
  property_types,
  active,
  created_at,
  updated_at
)
SELECT 
  id,
  agent_id as buyer_id, -- Note: agent_id in old schema becomes buyer_id
  price_min::INTEGER as budget_min,
  price_max::INTEGER as budget_max,
  beds as beds_min,
  baths::INTEGER as baths_min,
  CASE 
    WHEN property_type IS NOT NULL THEN ARRAY[property_type]
    ELSE ARRAY[]::TEXT[]
  END as property_types,
  TRUE as active,
  created_at,
  updated_at
FROM buyer_need_posts
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MIGRATE LISTING POSTS TO LISTINGS
-- ============================================================
INSERT INTO listings (
  id,
  seller_id,
  title,
  description,
  address_public,
  address_private,
  price,
  beds,
  baths,
  property_type,
  features,
  status,
  listing_verified,
  freshness_verified_at,
  created_at,
  updated_at
)
SELECT 
  id,
  agent_id as seller_id,
  COALESCE(address, city || ', ' || state, 'Property Listing') as title,
  NULL as description,
  address as address_public,
  address as address_private, -- Will be hidden by RLS until match
  list_price::INTEGER as price,
  beds,
  baths::INTEGER as baths,
  property_type,
  features,
  CASE 
    WHEN listing_status = 'live' THEN 'active'
    WHEN listing_status = 'under_contract' THEN 'pending'
    WHEN listing_status = 'sold' THEN 'sold'
    WHEN listing_status = 'stale' THEN 'inactive'
    ELSE 'draft'
  END::TEXT as status,
  COALESCE(verified, FALSE) as listing_verified,
  last_verified_at as freshness_verified_at,
  created_at,
  updated_at
FROM listing_posts
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MIGRATE EXISTING MATCHES
-- ============================================================
-- Update matches table to include seller_id from listing
INSERT INTO matches (id, listing_id, buyer_id, seller_id, match_score, created_at)
SELECT 
  m.id,
  m.listing_post_id as listing_id,
  bn.agent_id as buyer_id, -- buyer from buyer_need_post
  lp.agent_id as seller_id, -- seller from listing_post
  COALESCE(m.score, 0)::NUMERIC(5, 2) as match_score,
  m.created_at
FROM matches m
JOIN buyer_need_posts bn ON m.buyer_need_post_id = bn.id
JOIN listing_posts lp ON m.listing_post_id = lp.id
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CREATE DEAL ROOMS FROM EXISTING OFFER ROOMS
-- ============================================================
INSERT INTO deal_rooms (id, match_id, status, created_at, updated_at)
SELECT 
  or_room.id,
  or_room.match_id,
  'matched'::TEXT as status,
  or_room.created_at,
  or_room.created_at as updated_at
FROM offer_rooms or_room
WHERE or_room.match_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CREATE DEAL PARTICIPANTS FROM MATCHES
-- ============================================================
INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal, created_at)
SELECT DISTINCT
  dr.id as deal_room_id,
  m.buyer_id as profile_id,
  'buyer'::TEXT as role_in_deal,
  NOW() as created_at
FROM deal_rooms dr
JOIN matches m ON dr.match_id = m.id
ON CONFLICT (deal_room_id, profile_id) DO NOTHING;

INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal, created_at)
SELECT DISTINCT
  dr.id as deal_room_id,
  m.seller_id as profile_id,
  'seller'::TEXT as role_in_deal,
  NOW() as created_at
FROM deal_rooms dr
JOIN matches m ON dr.match_id = m.id
ON CONFLICT (deal_room_id, profile_id) DO NOTHING;

-- ============================================================
-- UPDATE CONVERSATIONS TO REFERENCE DEAL ROOMS
-- ============================================================
UPDATE conversations c
SET deal_room_id = dr.id
FROM deal_rooms dr
JOIN matches m ON dr.match_id = m.id
WHERE c.listing_post_id = m.listing_id
AND c.buyer_id = m.buyer_id
AND c.deal_room_id IS NULL;

-- ============================================================
-- UPDATE MESSAGES TO USE SENDER_PROFILE_ID
-- ============================================================
UPDATE messages msg
SET sender_profile_id = msg.sender_id::UUID
WHERE sender_profile_id IS NULL
AND sender_id IS NOT NULL;

-- ============================================================
-- UPDATE TASKS TO REFERENCE DEAL ROOMS
-- ============================================================
UPDATE tasks t
SET deal_room_id = dr.id,
    assignee_profile_id = (
      SELECT profile_id FROM deal_participants dp
      WHERE dp.deal_room_id = dr.id
      AND dp.role_in_deal = t.assigned_role
      LIMIT 1
    )
FROM deal_rooms dr
JOIN matches m ON dr.match_id = m.id
WHERE t.offer_room_id IS NOT NULL
AND t.deal_room_id IS NULL
AND EXISTS (
  SELECT 1 FROM offer_rooms or_room
  WHERE or_room.id = t.offer_room_id
  AND or_room.match_id = m.id
);

