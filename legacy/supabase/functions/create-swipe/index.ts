// supabase/functions/create-swipe/index.ts
// Edge Function: Handle swipe creation and match detection
// Validates verification rules and creates matches when mutual acceptance achieved

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Swipe configuration constants (inline for Deno)
const BUYER_SWIPE_YES_REQUIRES_VERIFICATION = 3;
const SELLER_ACCEPT_REQUIRES_VERIFICATION = 2;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SwipeRequest {
  actor_id: string;
  target_type: 'listing' | 'buyer_intent';
  target_id: string;
  direction: 'yes' | 'no';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { actor_id, target_type, target_id, direction }: SwipeRequest = await req.json();

    if (!actor_id || !target_type || !target_id || !direction) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get actor profile
    const { data: actorProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', actor_id)
      .single();

    if (profileError || !actorProfile) {
      return new Response(
        JSON.stringify({ error: 'Actor profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate verification rules for YES swipes
    if (direction === 'yes') {
      if (target_type === 'listing') {
        // Buyers cannot YES swipe unless verification_level >= 3
        if (actorProfile.role === 'buyer' && actorProfile.verification_level < BUYER_SWIPE_YES_REQUIRES_VERIFICATION) {
          return new Response(
            JSON.stringify({ 
              error: `Buyers need verification level ${BUYER_SWIPE_YES_REQUIRES_VERIFICATION} to like listings`,
              required_verification: BUYER_SWIPE_YES_REQUIRES_VERIFICATION,
              current_verification: actorProfile.verification_level
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (target_type === 'buyer_intent') {
        // Sellers cannot accept buyers unless listing_verified OR verification_level >= 2
        if (actorProfile.role === 'seller') {
          // Check if seller has verified listings
          const { data: verifiedListings } = await supabaseClient
            .from('listings')
            .select('id')
            .eq('seller_id', actor_id)
            .eq('listing_verified', true)
            .limit(1);

          const hasVerifiedListing = verifiedListings && verifiedListings.length > 0;
          const hasVerification = actorProfile.verification_level >= SELLER_ACCEPT_REQUIRES_VERIFICATION;

          if (!hasVerifiedListing && !hasVerification) {
            return new Response(
              JSON.stringify({ 
                error: 'Sellers need verified listings or verification level 2+ to accept buyers',
                required_verification: SELLER_ACCEPT_REQUIRES_VERIFICATION
              }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    // Create or update swipe
    const { data: swipe, error: swipeError } = await supabaseClient
      .from('swipes')
      .upsert({
        actor_id,
        target_type,
        target_id,
        direction,
      }, {
        onConflict: 'actor_id,target_type,target_id'
      })
      .select()
      .single();

    if (swipeError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create swipe', details: swipeError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for mutual acceptance (both swiped YES)
    if (direction === 'yes') {
      let listingId: string | null = null;
      let buyerId: string | null = null;
      let sellerId: string | null = null;

      if (target_type === 'listing') {
        // Buyer swiped YES on listing
        const { data: listing } = await supabaseClient
          .from('listings')
          .select('id, seller_id')
          .eq('id', target_id)
          .single();

        if (listing) {
          listingId = listing.id;
          buyerId = actor_id;
          sellerId = listing.seller_id;

          // Check if seller swiped YES on buyer's intent
          const { data: buyerIntent } = await supabaseClient
            .from('buyer_intents')
            .select('id')
            .eq('buyer_id', buyerId)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (buyerIntent) {
            const { data: sellerSwipe } = await supabaseClient
              .from('swipes')
              .select('*')
              .eq('actor_id', sellerId)
              .eq('target_type', 'buyer_intent')
              .eq('target_id', buyerIntent.id)
              .eq('direction', 'yes')
              .single();

            if (sellerSwipe) {
              // MUTUAL MATCH! Create match, deal room, conversation, tasks
              await createMatchAndDealRoom(supabaseClient, {
                listingId,
                buyerId,
                sellerId,
                buyerIntentId: buyerIntent.id,
              });
            }
          }
        }
      } else if (target_type === 'buyer_intent') {
        // Seller swiped YES on buyer intent
        const { data: buyerIntent } = await supabaseClient
          .from('buyer_intents')
          .select('id, buyer_id')
          .eq('id', target_id)
          .single();

        if (buyerIntent) {
          buyerId = buyerIntent.buyer_id;
          sellerId = actor_id;

          // Check if buyer swiped YES on any of seller's listings
          const { data: sellerListings } = await supabaseClient
            .from('listings')
            .select('id')
            .eq('seller_id', sellerId)
            .eq('status', 'active');

          if (sellerListings && sellerListings.length > 0) {
            for (const listing of sellerListings) {
              const { data: buyerSwipe } = await supabaseClient
                .from('swipes')
                .select('*')
                .eq('actor_id', buyerId)
                .eq('target_type', 'listing')
                .eq('target_id', listing.id)
                .eq('direction', 'yes')
                .single();

              if (buyerSwipe) {
                // MUTUAL MATCH!
                listingId = listing.id;
                await createMatchAndDealRoom(supabaseClient, {
                  listingId,
                  buyerId,
                  sellerId,
                  buyerIntentId: buyerIntent.id,
                });
                break;
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        swipe,
        match_created: direction === 'yes' // Will be true if match was created
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createMatchAndDealRoom(
  supabaseClient: any,
  { listingId, buyerId, sellerId, buyerIntentId }: {
    listingId: string;
    buyerId: string;
    sellerId: string;
    buyerIntentId: string;
  }
) {
  // 1. Create match
  const { data: match, error: matchError } = await supabaseClient
    .from('matches')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      match_score: 0.85, // Default score for mutual swipe
    })
    .select()
    .single();

  if (matchError) {
    console.error('Failed to create match:', matchError);
    return;
  }

  // 2. Create deal room
  const { data: dealRoom, error: dealRoomError } = await supabaseClient
    .from('deal_rooms')
    .insert({
      match_id: match.id,
      status: 'matched',
    })
    .select()
    .single();

  if (dealRoomError) {
    console.error('Failed to create deal room:', dealRoomError);
    return;
  }

  // 3. Create deal participants
  await supabaseClient
    .from('deal_participants')
    .insert([
      { deal_room_id: dealRoom.id, profile_id: buyerId, role_in_deal: 'buyer' },
      { deal_room_id: dealRoom.id, profile_id: sellerId, role_in_deal: 'seller' },
    ]);

  // 4. Create conversation
  const { data: conversation } = await supabaseClient
    .from('conversations')
    .insert({
      deal_room_id: dealRoom.id,
    })
    .select()
    .single();

  // 5. Create initial tasks (role-specific)
  const tasks = [
    // Buyer tasks
    {
      deal_room_id: dealRoom.id,
      assignee_profile_id: buyerId,
      title: 'Confirm budget + timeline',
      description: 'Verify your budget and preferred closing timeline',
      status: 'todo',
      due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 days
    },
    {
      deal_room_id: dealRoom.id,
      assignee_profile_id: buyerId,
      title: 'Upload pre-approval/proof-of-funds',
      description: 'Upload your pre-approval letter or proof of funds',
      status: 'todo',
      due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // +3 days
    },
    {
      deal_room_id: dealRoom.id,
      assignee_profile_id: buyerId,
      title: 'Request tour times',
      description: 'Request available tour times for this property',
      status: 'todo',
      due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // +5 days
    },
    // Seller tasks
    {
      deal_room_id: dealRoom.id,
      assignee_profile_id: sellerId,
      title: 'Confirm availability',
      description: 'Confirm your availability for tours and showings',
      status: 'todo',
      due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 days
    },
    {
      deal_room_id: dealRoom.id,
      assignee_profile_id: sellerId,
      title: 'Upload disclosures (optional)',
      description: 'Upload any required property disclosures',
      status: 'todo',
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
    },
    {
      deal_room_id: dealRoom.id,
      assignee_profile_id: sellerId,
      title: 'Review tour request',
      description: 'Review and respond to buyer tour requests',
      status: 'todo',
      due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // +1 day
    },
  ];

  await supabaseClient
    .from('tasks')
    .insert(tasks);

  return { match, dealRoom, conversation };
}

