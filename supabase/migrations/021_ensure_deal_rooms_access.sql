-- Migration 021: Ensure deal_rooms SELECT access works correctly
-- This migration ensures users can access deal rooms if they're buyer/seller in the match
-- Uses SECURITY DEFINER function to bypass RLS recursion

-- Ensure the is_user_in_match function exists (from migration 011)
CREATE OR REPLACE FUNCTION is_user_in_match(match_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM matches m
    WHERE m.id = match_uuid
    AND (
      m.buyer_id = user_uuid
      OR m.seller_id = user_uuid
    )
  );
END;
$$;

-- Drop and recreate deal_rooms SELECT policy to ensure it's correct
DROP POLICY IF EXISTS "Users can view deal rooms they participate in" ON deal_rooms;

-- Ensure RLS is enabled
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;

-- Create the SELECT policy using the SECURITY DEFINER function
-- This allows users to see deal rooms if they're buyer or seller in the associated match
CREATE POLICY "Users can view deal rooms they participate in"
  ON deal_rooms FOR SELECT
  USING (
    is_user_in_match(match_id, auth.uid())
  );
