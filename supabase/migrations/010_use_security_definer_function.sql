-- Migration 010: Use SECURITY DEFINER function to bypass RLS recursion
-- Create a function that can check matches without triggering RLS recursion
-- This function runs with the privileges of the function creator, bypassing RLS

-- Create a function to check if user is in a match for a deal_room
CREATE OR REPLACE FUNCTION is_user_in_deal_room_match(deal_room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM deal_rooms dr
    INNER JOIN matches m ON m.id = dr.match_id
    WHERE dr.id = deal_room_uuid
    AND (
      m.buyer_id = user_uuid
      OR m.seller_id = user_uuid
    )
  );
END;
$$;

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view participants in their deal rooms" ON deal_participants;

-- Create a policy that uses the SECURITY DEFINER function
-- This avoids RLS recursion because the function bypasses RLS checks
CREATE POLICY "Users can view participants in their deal rooms"
  ON deal_participants FOR SELECT
  USING (
    -- Case 1: User is the participant themselves
    profile_id = auth.uid()
    OR
    -- Case 2: User is buyer or seller in the match (using function to avoid recursion)
    is_user_in_deal_room_match(deal_room_id, auth.uid())
  );

