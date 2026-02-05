-- Migration 016: Verify all users, buyer intents, and listings
-- Sets all verification flags to true for testing purposes

-- Step 1: Verify all buyer profiles
UPDATE profiles
SET 
  buyer_verified = true,
  verification_level = 3
WHERE role = 'buyer';

-- Step 2: Verify all seller profiles
UPDATE profiles
SET 
  seller_verified = true,
  verification_level = 3
WHERE role = 'seller';

-- Step 3: Verify all buyer intents
UPDATE buyer_intents
SET 
  verified = true,
  readiness_score = GREATEST(readiness_score, 85) -- Set minimum readiness score to 85
WHERE verified = false OR verified IS NULL;

-- Step 4: Verify all listings
UPDATE listings
SET 
  listing_verified = true,
  freshness_verified_at = NOW() -- Set to current time
WHERE listing_verified = false OR listing_verified IS NULL;

-- Step 5: Verify all other profiles (agents, support, etc.)
UPDATE profiles
SET 
  verification_level = 3
WHERE verification_level < 3 OR verification_level IS NULL;

-- Show summary
SELECT 
  'Buyers verified' as summary,
  COUNT(*) as count
FROM profiles
WHERE role = 'buyer' AND buyer_verified = true
UNION ALL
SELECT 
  'Sellers verified' as summary,
  COUNT(*) as count
FROM profiles
WHERE role = 'seller' AND seller_verified = true
UNION ALL
SELECT 
  'Buyer intents verified' as summary,
  COUNT(*) as count
FROM buyer_intents
WHERE verified = true
UNION ALL
SELECT 
  'Listings verified' as summary,
  COUNT(*) as count
FROM listings
WHERE listing_verified = true;
