-- Migration 024: Create deal rooms for matches that don't have them
-- This migration backfills deal rooms for existing matches and ensures
-- future matches automatically get deal rooms via a trigger

-- ============================================
-- STEP 1: Create deal rooms for existing matches without deal rooms
-- ============================================

-- Insert deal rooms for matches that don't have them
INSERT INTO deal_rooms (match_id, status)
SELECT 
  m.id as match_id,
  'matched' as status
FROM matches m
WHERE NOT EXISTS (
  SELECT 1 
  FROM deal_rooms dr 
  WHERE dr.match_id = m.id
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 2: Create deal participants for deal rooms that don't have them
-- ============================================

-- Insert buyer participants
INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal)
SELECT 
  dr.id as deal_room_id,
  m.buyer_id as profile_id,
  'buyer' as role_in_deal
FROM deal_rooms dr
JOIN matches m ON m.id = dr.match_id
WHERE NOT EXISTS (
  SELECT 1 
  FROM deal_participants dp 
  WHERE dp.deal_room_id = dr.id 
  AND dp.profile_id = m.buyer_id
)
ON CONFLICT DO NOTHING;

-- Insert seller participants
INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal)
SELECT 
  dr.id as deal_room_id,
  m.seller_id as profile_id,
  'seller' as role_in_deal
FROM deal_rooms dr
JOIN matches m ON m.id = dr.match_id
WHERE NOT EXISTS (
  SELECT 1 
  FROM deal_participants dp 
  WHERE dp.deal_room_id = dr.id 
  AND dp.profile_id = m.seller_id
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: Create conversations for deal rooms that don't have them
-- ============================================

-- Insert conversations for deal rooms that don't have them
INSERT INTO conversations (deal_room_id)
SELECT 
  dr.id as deal_room_id
FROM deal_rooms dr
WHERE NOT EXISTS (
  SELECT 1 
  FROM conversations c 
  WHERE c.deal_room_id = dr.id
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 4: Create trigger function to auto-create deal rooms for new matches
-- ============================================

-- Function to create deal room, participants, and conversation when a match is created
CREATE OR REPLACE FUNCTION create_deal_room_for_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_deal_room_id UUID;
BEGIN
  -- Create deal room
  INSERT INTO deal_rooms (match_id, status)
  VALUES (NEW.id, 'matched')
  RETURNING id INTO new_deal_room_id;

  -- Create participants
  INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal)
  VALUES 
    (new_deal_room_id, NEW.buyer_id, 'buyer'),
    (new_deal_room_id, NEW.seller_id, 'seller')
  ON CONFLICT DO NOTHING;

  -- Create conversation
  INSERT INTO conversations (deal_room_id)
  VALUES (new_deal_room_id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_deal_room_on_match ON matches;

-- Create trigger
CREATE TRIGGER trigger_create_deal_room_on_match
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION create_deal_room_for_match();
