-- Migration 017: Allow sellers to view buyer profiles when viewing buyer intents
-- This enables sellers to see buyer verification status when viewing leads
-- Note: We use a security definer function to avoid infinite recursion

-- First, create a function to check if current user is a verified seller
CREATE OR REPLACE FUNCTION is_verified_seller()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'seller'
    AND seller_verified = true
  );
END;
$$;

-- Drop old policy that only allows users to see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile or sellers can view buyer profiles" ON profiles;

-- New policy: Users can see their own profile OR sellers can see buyer profiles
-- Uses security definer function to avoid infinite recursion
CREATE POLICY "Users can view own profile or sellers can view buyer profiles"
  ON profiles FOR SELECT
  USING (
    -- Users can always see their own profile
    auth.uid() = id
    OR
    -- Sellers can see buyer profiles (needed for buyer intent verification checks)
    -- Use security definer function to avoid recursion
    (is_verified_seller() AND role = 'buyer')
  );
