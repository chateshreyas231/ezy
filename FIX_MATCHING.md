# Fix Matching Issue - Complete Guide

## 🔴 Problem

Buyer and Seller both swiped YES, but no match appears in the Matches screen.

## 🎯 Root Cause

**Missing RLS (Row Level Security) INSERT policies** on the `matches` table. The app cannot create match records because the database blocks INSERT operations.

---

## ✅ Solution - Step by Step

### Step 1: Apply RLS Policies in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to SQL Editor** (left sidebar)
4. **Paste this SQL** and click "Run":

```sql
-- Enable INSERT for matches table
DROP POLICY IF EXISTS "Authenticated users can create matches" ON matches;

CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Enable INSERT for deal_rooms
DROP POLICY IF EXISTS "Users can create deal rooms for their matches" ON deal_rooms;

CREATE POLICY "Users can create deal rooms for their matches"
  ON deal_rooms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
        AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())
    )
  );

-- Enable INSERT for deal_participants
DROP POLICY IF EXISTS "Users can add participants to deal rooms they're in" ON deal_participants;

CREATE POLICY "Users can add participants to deal rooms they're in"
  ON deal_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_rooms
      JOIN matches ON matches.id = deal_rooms.match_id
      WHERE deal_rooms.id = deal_room_id
        AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())
    )
  );

-- Enable INSERT for conversations
DROP POLICY IF EXISTS "Users can create conversations in their deal rooms" ON conversations;

CREATE POLICY "Users can create conversations in their deal rooms"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_rooms
      JOIN matches ON matches.id = deal_rooms.match_id
      WHERE deal_rooms.id = deal_room_id
        AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid())
    )
  );
```

5. **Verify success**: Should see "Success. No rows returned"

---

### Step 2: Clear Old Test Data

Run this SQL to clear existing swipes and start fresh:

```sql
-- Clear all swipes for buyer1 and seller1
DELETE FROM swipes 
WHERE actor_id IN (
  SELECT id FROM profiles 
  WHERE display_name LIKE '%Buyer 1%' OR display_name LIKE '%Seller 1%'
);

-- Clear any incomplete matches
DELETE FROM matches 
WHERE buyer_id IN (
  SELECT id FROM profiles WHERE display_name LIKE '%Buyer 1%'
);
```

---

### Step 3: Test the Flow

#### A. As Buyer (buyer1@ezriya.test / test123456)

1. Login to the app
2. Go to **Feed** tab
3. Swipe **YES** on a listing
4. **Check console logs**:
   ```
   ✅ [useSwipe] Swipe created: [swipe-id]
   🟡 [useSwipe] Buyer created request (waiting for seller)
   ✅ Request sent to seller
   ```
5. **Note the listing ID** from the logs (e.g., `5dbd0cc8-fcdd-4062-85c9-4b6e103c4b90`)

#### B. As Seller (seller1@ezriya.test / test123456)

1. Logout and login as seller
2. Go to **Leads** tab
3. You should see the buyer's intent with a **"REQUEST"** badge
4. Swipe **YES** on that buyer intent
5. **Check console logs**:
   ```
   🔵 [useSwipe] Seller accepted buyer intent, checking for match...
   🔵 [useSwipe] Buyer ID: [buyer-id]
   🔵 [useSwipe] Seller has X active listings
   🔵 [useSwipe] Buyer swipes on seller listings: 1
   🎉 [useSwipe] MATCH DETECTED! Creating match...
   🟡 [useSwipe] Creating match directly (fallback)
   ✅ [useSwipe] Match created: [match-id]
   ✅ [useSwipe] Deal room created: [deal-room-id]
   ```
6. **Should see alert**: "It's a Match! 🎉"

#### C. Check Matches

1. **As Buyer**: Go to **Matches** tab → Should see the listing
2. **As Seller**: Go to **Matches** tab → Should see the buyer
3. **Click match** → Opens deal room

---

## 🐛 Debugging

### If No Listings Appear in Feed

**Check:**
```sql
-- How many active listings exist?
SELECT COUNT(*) FROM listings WHERE status = 'active';

-- Are they verified?
SELECT id, title, seller_id, status, listing_verified 
FROM listings 
WHERE status = 'active' 
LIMIT 5;
```

**Fix:**
```sql
-- Make listings active and verified
UPDATE listings 
SET status = 'active', listing_verified = true 
WHERE status = 'draft';
```

### If Seller Doesn't See Buyer Intent

**Check:**
```sql
-- Does buyer have an active intent?
SELECT * FROM buyer_intents 
WHERE buyer_id = (SELECT id FROM profiles WHERE display_name LIKE '%Buyer 1%')
  AND active = true;
```

**Fix:**
```sql
-- Ensure buyer intent is active
UPDATE buyer_intents 
SET active = true 
WHERE buyer_id = (SELECT id FROM profiles WHERE display_name LIKE '%Buyer 1%');
```

### If Match Not Appearing

**Check:**
```sql
-- Were both swipes created?
SELECT 
  s.id,
  s.actor_id,
  p.display_name,
  s.target_type,
  s.target_id,
  s.direction,
  s.created_at
FROM swipes s
JOIN profiles p ON p.id = s.actor_id
WHERE p.display_name LIKE '%Buyer 1%' OR p.display_name LIKE '%Seller 1%'
ORDER BY s.created_at DESC;

-- Was match created?
SELECT 
  m.*,
  b.display_name as buyer_name,
  s.display_name as seller_name,
  l.title as listing_title
FROM matches m
JOIN profiles b ON b.id = m.buyer_id
JOIN profiles s ON s.id = m.seller_id
JOIN listings l ON l.id = m.listing_id
WHERE b.display_name LIKE '%Buyer 1%' OR s.display_name LIKE '%Seller 1%';
```

---

## 🔄 Complete Reset & Test

If you want to start completely fresh:

```sql
-- 1. Clear all test data
DELETE FROM deal_participants WHERE deal_room_id IN (
  SELECT dr.id FROM deal_rooms dr
  JOIN matches m ON m.id = dr.match_id
  WHERE m.buyer_id IN (SELECT id FROM profiles WHERE display_name LIKE '%Buyer 1%')
);

DELETE FROM deal_rooms WHERE match_id IN (
  SELECT id FROM matches 
  WHERE buyer_id IN (SELECT id FROM profiles WHERE display_name LIKE '%Buyer 1%')
);

DELETE FROM matches WHERE buyer_id IN (
  SELECT id FROM profiles WHERE display_name LIKE '%Buyer 1%'
);

DELETE FROM swipes WHERE actor_id IN (
  SELECT id FROM profiles 
  WHERE display_name LIKE '%Buyer 1%' OR display_name LIKE '%Seller 1%'
);

-- 2. Verify listings are active
UPDATE listings 
SET status = 'active', listing_verified = true
WHERE seller_id IN (SELECT id FROM profiles WHERE display_name LIKE '%Seller 1%');

-- 3. Verify buyer intent is active
UPDATE buyer_intents 
SET active = true
WHERE buyer_id IN (SELECT id FROM profiles WHERE display_name LIKE '%Buyer 1%');
```

Then test the flow again from scratch.

---

## 📊 Current Status Check

Run this to see the current state:

```sql
-- Buyer 1 info
SELECT 
  'Buyer 1' as user_type,
  p.id,
  p.display_name,
  p.buyer_verified,
  p.verification_level,
  bi.id as intent_id,
  bi.active as intent_active,
  bi.budget_min,
  bi.budget_max
FROM profiles p
LEFT JOIN buyer_intents bi ON bi.buyer_id = p.id
WHERE p.display_name LIKE '%Buyer 1%';

-- Seller 1 info
SELECT 
  'Seller 1' as user_type,
  p.id,
  p.display_name,
  p.seller_verified,
  COUNT(l.id) as listing_count,
  COUNT(CASE WHEN l.status = 'active' THEN 1 END) as active_listings
FROM profiles p
LEFT JOIN listings l ON l.seller_id = p.id
WHERE p.display_name LIKE '%Seller 1%'
GROUP BY p.id, p.display_name, p.seller_verified;

-- Recent swipes
SELECT 
  p.display_name as swiper,
  s.target_type,
  s.direction,
  s.created_at,
  CASE 
    WHEN s.target_type = 'listing' THEN (SELECT title FROM listings WHERE id = s.target_id::uuid)
    ELSE 'Buyer Intent'
  END as target_name
FROM swipes s
JOIN profiles p ON p.id = s.actor_id
WHERE p.display_name LIKE '%Buyer 1%' OR p.display_name LIKE '%Seller 1%'
ORDER BY s.created_at DESC
LIMIT 10;

-- Matches
SELECT 
  m.id,
  b.display_name as buyer,
  s.display_name as seller,
  l.title as listing,
  m.created_at,
  dr.id as deal_room_id
FROM matches m
JOIN profiles b ON b.id = m.buyer_id
JOIN profiles s ON s.id = m.seller_id
JOIN listings l ON l.id = m.listing_id
LEFT JOIN deal_rooms dr ON dr.match_id = m.id
WHERE b.display_name LIKE '%Buyer 1%' OR s.display_name LIKE '%Seller 1%';
```

---

## ✅ After Applying Policies

Once you've applied the RLS policies in Supabase Dashboard:

1. **Restart the app** (reload in simulator)
2. **Login as buyer** → Swipe YES on a listing
3. **Login as seller** → Swipe YES on the buyer intent
4. **Check console** → Should see "🎉 MATCH DETECTED!"
5. **Check Matches tab** → Should see the match

The match will be created automatically and appear in both users' Matches screens!
