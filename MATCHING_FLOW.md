# Matching Flow - How Matches Are Created

## Overview

The Ezriya platform uses a **two-sided matching system** where both buyer and seller must swipe "YES" to create a match. This document explains the complete flow.

---

## The Matching Process

### Step 1: Buyer Swipes YES on Listing

**Location:** `apps/mobile/app/(buyer)/(tabs)/feed.tsx`

```typescript
// Buyer sees listing and swipes YES
const handleSwipe = async (direction: 'yes' | 'no') => {
  const result = await createSwipe({
    target_type: 'listing',
    target_id: currentCard.listing.id,
    direction: 'yes',
  });
  
  // Result: { is_request: true, matched: false }
  // This creates a "request" - waiting for seller to accept
};
```

**What Happens:**
1. Swipe record created in `swipes` table
2. `is_request: true` returned (waiting for seller)
3. No match created yet
4. Buyer moves to next listing

**Database:**
```sql
INSERT INTO swipes (actor_id, target_type, target_id, direction)
VALUES (buyer_id, 'listing', listing_id, 'yes');
```

---

### Step 2: Seller Sees Buyer Intent

**Location:** `apps/mobile/app/(seller)/(tabs)/leads.tsx`

The seller's leads screen shows two types of buyer intents:

#### A. **Requests** (Priority)
- Buyers who already swiped YES on seller's listings
- Marked with "REQUEST" badge
- Shown first in the feed
- High match score (100%)

#### B. **General Leads**
- All other active buyer intents
- Filtered by seller's listing criteria
- Match score calculated by algorithm

**Code:**
```typescript
const loadLeads = async () => {
  // Get seller's active listings
  const { data: sellerListings } = await supabase
    .from('listings')
    .select('id')
    .eq('seller_id', user.id)
    .eq('status', 'active');

  // Get buyers who swiped YES on seller's listings
  const { data: buyerSwipes } = await supabase
    .from('swipes')
    .select('target_id, actor_id')
    .eq('target_type', 'listing')
    .eq('direction', 'yes')
    .in('target_id', listingIds);

  // Get buyer intents for these buyers
  const buyerIds = [...new Set(buyerSwipes.map(s => s.actor_id))];
  const { data: requestIntents } = await supabase
    .from('buyer_intents')
    .select('*')
    .in('buyer_id', buyerIds)
    .eq('active', true);

  // Mark these as requests
  const requests = requestIntents.map(intent => ({
    intent,
    buyer,
    isRequest: true,
    listingId: buyerSwipes.find(s => s.actor_id === intent.buyer_id)?.target_id
  }));

  setRequests(requests); // Show these first
};
```

---

### Step 3: Seller Swipes YES on Buyer Intent

**Location:** `apps/mobile/app/(seller)/(tabs)/leads.tsx`

```typescript
const handleSwipe = async (direction: 'yes' | 'no') => {
  const result = await createSwipe({
    target_type: 'buyer_intent',
    target_id: currentIntent.intent.id,
    direction: 'yes',
  });

  if (result?.matched) {
    // MATCH CREATED!
    Alert.alert(
      'It\'s a Match! 🎉',
      'You and the buyer have both shown interest. A deal room has been created.',
      [
        {
          text: 'View Match',
          onPress: () => router.push(`/deal/${result.deal_room_id}`)
        },
        { text: 'Continue', style: 'cancel' }
      ]
    );
  }
};
```

**What Happens:**
1. Swipe record created in `swipes` table
2. Edge function checks if buyer already swiped YES on seller's listing
3. If YES → Creates match + deal room
4. Returns `{ matched: true, deal_room_id: '...' }`
5. Seller sees success alert

---

### Step 4: Edge Function Creates Match

**Location:** `supabase/functions/create-swipe/index.ts`

```typescript
// When seller swipes YES on buyer intent
if (target_type === 'buyer_intent' && profile.role === 'seller') {
  // 1. Get buyer ID from intent
  const { data: buyerIntent } = await supabaseClient
    .from('buyer_intents')
    .select('buyer_id')
    .eq('id', target_id)
    .single();

  // 2. Get seller's active listings
  const { data: sellerListings } = await supabaseClient
    .from('listings')
    .select('id')
    .eq('seller_id', actorId)
    .eq('status', 'active');

  const listingIds = sellerListings.map(l => l.id);

  // 3. Check if buyer swiped YES on any of seller's listings
  const { data: buyerSwipes } = await supabaseClient
    .from('swipes')
    .select('target_id')
    .eq('actor_id', buyerIntent.buyer_id)
    .eq('target_type', 'listing')
    .eq('direction', 'yes')
    .in('target_id', listingIds);

  if (buyerSwipes && buyerSwipes.length > 0) {
    // MATCH! Create match record
    const listingId = buyerSwipes[0].target_id;
    
    // 4. Create match
    const { data: match } = await supabaseClient
      .from('matches')
      .insert({
        listing_id: listingId,
        buyer_id: buyerIntent.buyer_id,
        seller_id: actorId,
        match_score: 0.8,
        explanation: 'Mutual acceptance',
      })
      .select()
      .single();

    // 5. Create deal room
    const { data: dealRoom } = await supabaseClient
      .from('deal_rooms')
      .insert({
        match_id: match.id,
        status: 'matched',
      })
      .select()
      .single();

    // 6. Add participants
    await supabaseClient
      .from('deal_participants')
      .insert([
        { deal_room_id: dealRoom.id, profile_id: buyerIntent.buyer_id, role_in_deal: 'buyer' },
        { deal_room_id: dealRoom.id, profile_id: actorId, role_in_deal: 'seller' },
      ]);

    // 7. Create conversation
    await supabaseClient
      .from('conversations')
      .insert({ deal_room_id: dealRoom.id });

    // 8. Create initial tasks
    // ... (buyer and seller tasks)

    return { matched: true, dealRoomId: dealRoom.id };
  }
}
```

**Database Changes:**
```sql
-- 1. Match record
INSERT INTO matches (listing_id, buyer_id, seller_id, match_score, explanation)
VALUES (...);

-- 2. Deal room
INSERT INTO deal_rooms (match_id, status)
VALUES (match_id, 'matched');

-- 3. Participants
INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal)
VALUES 
  (deal_room_id, buyer_id, 'buyer'),
  (deal_room_id, seller_id, 'seller');

-- 4. Conversation
INSERT INTO conversations (deal_room_id)
VALUES (deal_room_id);

-- 5. Tasks
INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, status)
VALUES (...);
```

---

### Step 5: Match Appears in Matches Screens

**Buyer Matches:** `apps/mobile/app/(buyer)/(tabs)/matches.tsx`

```typescript
const { fetchMatches } = useMatches();

// Fetches matches where:
// - buyer_id = current user
// - User has a "yes" swipe on the listing
const matches = await fetchMatches();

// Displays:
// - Listing title, price, beds, baths
// - Match date
// - Match score
// - "Deal Room" badge if deal room exists
```

**Seller Matches:** `apps/mobile/app/(seller)/(tabs)/matches.tsx`

```typescript
const { fetchMatches } = useMatches();

// Fetches matches where:
// - seller_id = current user
// - User has a "yes" swipe on the buyer intent
const matches = await fetchMatches();

// Displays:
// - Buyer name
// - Buyer budget
// - Readiness score
// - Match date
// - "Deal Room" badge
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BUYER SIDE                                │
└─────────────────────────────────────────────────────────────┘

1. Buyer opens feed
   ↓
2. Sees listing cards (filtered by intent)
   ↓
3. Swipes YES on listing
   ↓
   [createSwipe(target_type: 'listing', direction: 'yes')]
   ↓
4. Swipe recorded in database
   ↓
5. Returns: { is_request: true, matched: false }
   ↓
6. Buyer sees "Request sent" message
   ↓
7. Continues swiping...

┌─────────────────────────────────────────────────────────────┐
│                    SELLER SIDE                               │
└─────────────────────────────────────────────────────────────┘

1. Seller opens leads screen
   ↓
2. Sees buyer intents
   - REQUESTS (buyers who swiped YES on seller's listings) - shown first
   - General leads (other buyer intents)
   ↓
3. Seller swipes YES on buyer intent
   ↓
   [createSwipe(target_type: 'buyer_intent', direction: 'yes')]
   ↓
4. Edge function checks:
   - Did this buyer swipe YES on any of seller's listings?
   ↓
   ┌─────────────┴─────────────┐
   │                           │
   NO                         YES
   │                           │
   ↓                           ↓
5a. No match                5b. MATCH CREATED!
   - Swipe recorded            - Match record created
   - Returns: matched=false    - Deal room created
                               - Participants added
                               - Conversation created
                               - Tasks created
                               - Returns: matched=true, dealRoomId
   ↓                           ↓
6a. Seller continues        6b. Seller sees "Match!" alert
                               - Option to view deal room
                               - Match appears in matches screen

┌─────────────────────────────────────────────────────────────┐
│                  MATCHES SCREEN                              │
└─────────────────────────────────────────────────────────────┘

BUYER MATCHES:
- Shows all matches where buyer_id = current user
- Filtered to only show matches where buyer swiped YES
- Displays listing details
- Link to deal room

SELLER MATCHES:
- Shows all matches where seller_id = current user
- Filtered to only show matches where seller swiped YES
- Displays buyer details and budget
- Link to deal room
```

---

## Key Points

### ✅ Already Implemented

1. **Two-sided matching**: Both parties must swipe YES
2. **Request system**: Buyer swipes create "requests" for sellers
3. **Priority display**: Sellers see requests first
4. **Automatic match creation**: Edge function handles match logic
5. **Deal room creation**: Automatically created with match
6. **Filtered matches**: Only shows matches where user swiped YES

### 🎯 How It Works

- **Buyer swipes YES** → Creates request (no match yet)
- **Seller swipes YES on request** → Creates match immediately
- **Match appears** → In both buyer and seller matches screens
- **Deal room** → Created automatically with conversation and tasks

### 🔒 Verification Gates

- **Buyers**: Must have `verification_level >= 3` to swipe YES
- **Sellers**: No verification required for swiping
- **Listings**: Must be `status = 'active'` and `listing_verified = true`

---

## Testing the Flow

### Test Scenario

1. **As Buyer (buyer1@ezriya.test)**:
   ```
   - Login
   - Go to Feed
   - Swipe YES on a listing
   - See "Request sent" message
   ```

2. **As Seller (seller1@ezriya.test)**:
   ```
   - Login
   - Go to Leads
   - See buyer intent with "REQUEST" badge
   - Swipe YES on buyer intent
   - See "It's a Match! 🎉" alert
   ```

3. **Check Matches**:
   ```
   - Buyer: Go to Matches tab → See the listing
   - Seller: Go to Matches tab → See the buyer
   - Both: Click to open deal room
   ```

---

## Database Records Created

When a match is created:

```sql
-- 1. Match
matches {
  id: uuid,
  listing_id: uuid,
  buyer_id: uuid,
  seller_id: uuid,
  match_score: 0.8,
  explanation: 'Mutual acceptance',
  created_at: timestamp
}

-- 2. Deal Room
deal_rooms {
  id: uuid,
  match_id: uuid,
  status: 'matched',
  created_at: timestamp
}

-- 3. Participants (2 records)
deal_participants {
  deal_room_id: uuid,
  profile_id: buyer_id,
  role_in_deal: 'buyer'
}
deal_participants {
  deal_room_id: uuid,
  profile_id: seller_id,
  role_in_deal: 'seller'
}

-- 4. Conversation
conversations {
  id: uuid,
  deal_room_id: uuid,
  created_at: timestamp
}

-- 5. Tasks (5 records)
tasks {
  deal_room_id: uuid,
  assignee_profile_id: buyer_id,
  title: 'Confirm timeline',
  status: 'todo'
}
-- ... more tasks
```

---

## Why This Design?

### Benefits

1. **Buyer Control**: Buyers initiate interest
2. **Seller Efficiency**: Sellers only see interested buyers
3. **No Spam**: Sellers can't contact buyers who haven't shown interest
4. **Clear Intent**: Both parties explicitly express interest
5. **Automatic Setup**: Deal room and tasks created automatically

### User Experience

- **Buyer**: "I like this property" → Swipe YES → Wait for seller
- **Seller**: "This buyer is interested in my property" → Swipe YES → Match!
- **Both**: Immediately can start communicating in deal room

---

## Current Status

✅ **Fully Implemented and Working**

- Buyer swipe on listing → Creates request
- Seller swipe on buyer intent → Checks for match
- Match creation → Automatic with deal room
- Matches screen → Shows all matches with deal room links
- Filtering → Only shows matches where user swiped YES

**No changes needed** - the system is already working as designed!

---

## Troubleshooting

### "No matches appearing"

**Check:**
1. Did buyer swipe YES on listing?
2. Did seller swipe YES on buyer intent?
3. Is the listing `status = 'active'`?
4. Is the buyer intent `active = true`?
5. Is buyer `verification_level >= 3`?

**Debug:**
```sql
-- Check buyer swipes
SELECT * FROM swipes 
WHERE actor_id = 'buyer_id' 
  AND target_type = 'listing' 
  AND direction = 'yes';

-- Check seller swipes
SELECT * FROM swipes 
WHERE actor_id = 'seller_id' 
  AND target_type = 'buyer_intent' 
  AND direction = 'yes';

-- Check matches
SELECT * FROM matches 
WHERE buyer_id = 'buyer_id' 
   OR seller_id = 'seller_id';
```

### "Match created but not showing in matches screen"

**Possible causes:**
1. User didn't swipe YES (only shows matches where user swiped YES)
2. Deal room not created (check `deal_rooms` table)
3. Screen not refreshing (pull down to refresh)

**Solution:**
- Pull down to refresh matches screen
- Check console logs for errors
- Verify swipe records exist in database

---

## Future Enhancements

- [ ] Push notifications when match is created
- [ ] Match expiration (auto-archive after 30 days)
- [ ] Rematch feature (if deal falls through)
- [ ] Multiple listing matches (buyer matches with multiple listings from same seller)
- [ ] Agent involvement (agents can swipe on behalf of clients)

---

**Summary:** The matching system is fully functional. When a seller accepts a buyer intent (by swiping YES), and the buyer has already swiped YES on the seller's listing, a match is automatically created and appears in both the buyer and seller matches screens.
