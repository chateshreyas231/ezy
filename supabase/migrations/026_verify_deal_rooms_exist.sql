-- Migration 026: Verify deal rooms exist and diagnose RLS issues
-- This migration checks if deal rooms were created and provides diagnostics

-- Check if deal rooms exist for matches
DO $$
DECLARE
  match_count INTEGER;
  deal_room_count INTEGER;
  participant_count INTEGER;
  conversation_count INTEGER;
BEGIN
  -- Count matches
  SELECT COUNT(*) INTO match_count FROM matches;
  
  -- Count deal rooms
  SELECT COUNT(*) INTO deal_room_count FROM deal_rooms;
  
  -- Count participants
  SELECT COUNT(*) INTO participant_count FROM deal_participants;
  
  -- Count conversations
  SELECT COUNT(*) INTO conversation_count FROM conversations;
  
  RAISE NOTICE 'Matches: %, Deal Rooms: %, Participants: %, Conversations: %', 
    match_count, deal_room_count, participant_count, conversation_count;
  
  -- If there are matches but no deal rooms, create them
  IF match_count > 0 AND deal_room_count = 0 THEN
    RAISE NOTICE 'Creating deal rooms for existing matches...';
    
    -- Create deal rooms for matches that don't have them
    INSERT INTO deal_rooms (match_id, status)
    SELECT 
      m.id as match_id,
      'matched' as status
    FROM matches m
    WHERE NOT EXISTS (
      SELECT 1 
      FROM deal_rooms dr 
      WHERE dr.match_id = m.id
    );
    
    -- Create participants
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
    );
    
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
    );
    
    -- Create conversations
    INSERT INTO conversations (deal_room_id)
    SELECT 
      dr.id as deal_room_id
    FROM deal_rooms dr
    WHERE NOT EXISTS (
      SELECT 1 
      FROM conversations c 
      WHERE c.deal_room_id = dr.id
    );
    
    RAISE NOTICE 'Deal rooms, participants, and conversations created successfully!';
  END IF;
END;
$$;
