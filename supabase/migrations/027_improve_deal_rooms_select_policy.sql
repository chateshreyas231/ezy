-- Migration 027: Improve deal_rooms SELECT policy with faster participant check
-- Adds a fast path that checks deal_participants directly before falling back to match check

-- Drop and recreate deal_rooms SELECT policy with improved performance
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;

-- Ensure RLS is enabled
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

-- Create the SELECT policy with multiple access paths:
-- 1. User is a participant in the deal room (fast path, direct check)
-- 2. User is buyer/seller in the match (fallback, uses function)
-- The participant check is first because PostgreSQL short-circuits OR conditions
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    -- Fast path: Check if user is a participant (direct table access)
    -- This is faster because it doesn't require a function call
    EXISTS (
      SELECT 1
      FROM deal_participants dp
      WHERE dp.deal_room_id = deal_rooms.id
      AND dp.profile_id = auth.uid()
    )
    OR
    -- Fallback: Check if user is buyer/seller in the match (uses SECURITY DEFINER function)
    is_user_in_match(match_id, auth.uid())
  );
