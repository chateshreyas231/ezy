// Ezriya Platform - Create Swipe Edge Function
// Handles swipe creation and match detection

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MIN_VERIFICATION_FOR_BUYER_YES = 3;

serve(async (req) => {
  try {
    const { target_type, target_id, direction } = await req.json();

    if (!target_type || !target_id || !direction) {
      return new Response(
        JSON.stringify({ error: 'target_type, target_id, and direction are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['listing', 'buyer_intent'].includes(target_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid target_type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['yes', 'no'].includes(direction)) {
      return new Response(
        JSON.stringify({ error: 'Invalid direction' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enforce verification gate for buyer YES swipes
    if (profile.role === 'buyer' && direction === 'yes') {
      if (profile.verification_level < MIN_VERIFICATION_FOR_BUYER_YES) {
        return new Response(
          JSON.stringify({ error: 'Verification level 3 required to swipe YES' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Upsert swipe (unique on actor_id, target_type, target_id)
    const { data: swipe, error: swipeError } = await supabaseClient
      .from('swipes')
      .upsert({
        actor_id: user.id,
        target_type,
        target_id,
        direction,
      }, {
        onConflict: 'actor_id,target_type,target_id',
      })
      .select()
      .single();

    if (swipeError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create swipe' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For buyer YES swipes on listings: create a request (don't check for match immediately)
    // For seller YES swipes on buyer intents: check if buyer already swiped YES on seller's listing, then create match
    let matched = false;
    let dealRoomId: string | null = null;
    let isRequest = false;

    if (direction === 'yes') {
      if (target_type === 'listing' && profile.role === 'buyer') {
        // Buyer swiped YES on listing = create a request
        // Don't check for match - seller needs to accept first
        isRequest = true;
      } else if (target_type === 'buyer_intent' && profile.role === 'seller') {
        // Seller swiped YES on buyer intent = accept request (if buyer already swiped YES on seller's listing)
        const matchResult = await checkForMatch(supabaseClient, user.id, target_type, target_id);
        matched = matchResult.matched;
        dealRoomId = matchResult.dealRoomId;
      }
    }

    return new Response(
      JSON.stringify({
        matched,
        deal_room_id: dealRoomId,
        is_request: isRequest,
        swipe,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function checkForMatch(
  supabaseClient: any,
  actorId: string,
  targetType: string,
  targetId: string
): Promise<{ matched: boolean; dealRoomId: string | null }> {
  // This function is only called when seller swipes YES on buyer intent
  // Check if buyer already swiped YES on seller's listing
  if (targetType === 'buyer_intent') {
    // Seller swiped YES on buyer intent
    // Check if buyer swiped YES on seller's listing
    const buyerIntent = await supabaseClient
      .from('buyer_intents')
      .select('buyer_id')
      .eq('id', targetId)
      .single();

    if (!buyerIntent.data) {
      return { matched: false, dealRoomId: null };
    }

    // Get seller's active listings
    const { data: sellerListings } = await supabaseClient
      .from('listings')
      .select('id')
      .eq('seller_id', actorId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!sellerListings || sellerListings.length === 0) {
      return { matched: false, dealRoomId: null };
    }

    const listingIds = sellerListings.map((l: any) => l.id);

    // Check if buyer swiped YES on any of seller's listings
    const { data: buyerSwipes } = await supabaseClient
      .from('swipes')
      .select('target_id')
      .eq('actor_id', buyerIntent.data.buyer_id)
      .eq('target_type', 'listing')
      .eq('direction', 'yes')
      .in('target_id', listingIds);

    if (buyerSwipes && buyerSwipes.length > 0) {
      // MATCH! Buyer already swiped YES on seller's listing, and seller just swiped YES on buyer intent
      // Use the first matching listing
      const listingId = buyerSwipes[0].target_id;
      
      return await createMatch(supabaseClient, {
        listingId: listingId,
        buyerId: buyerIntent.data.buyer_id,
        sellerId: actorId,
        buyerIntentId: targetId,
      });
    }
  }

  return { matched: false, dealRoomId: null };
}

async function createMatch(
  supabaseClient: any,
  params: {
    listingId: string;
    buyerId: string;
    sellerId: string;
    buyerIntentId: string;
  }
): Promise<{ matched: boolean; dealRoomId: string | null }> {
  try {
    // Create match
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .insert({
        listing_id: params.listingId,
        buyer_id: params.buyerId,
        seller_id: params.sellerId,
        match_score: 0.8, // Default score
        explanation: 'Mutual acceptance',
      })
      .select()
      .single();

    if (matchError) {
      console.error('Failed to create match:', matchError);
      return { matched: false, dealRoomId: null };
    }

    // Create deal room
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
      return { matched: false, dealRoomId: null };
    }

    // Create deal participants
    await supabaseClient
      .from('deal_participants')
      .insert([
        { deal_room_id: dealRoom.id, profile_id: params.buyerId, role_in_deal: 'buyer' },
        { deal_room_id: dealRoom.id, profile_id: params.sellerId, role_in_deal: 'seller' },
      ]);

    // Create conversation
    const { data: conversation } = await supabaseClient
      .from('conversations')
      .insert({
        deal_room_id: dealRoom.id,
      })
      .select()
      .single();

    // Create initial tasks
    const buyerTasks = [
      { title: 'Confirm timeline', description: 'Share your preferred closing timeline' },
      { title: 'Upload pre-approval', description: 'Upload your pre-approval letter' },
      { title: 'Request tour times', description: 'Request available tour times' },
    ];

    const sellerTasks = [
      { title: 'Confirm availability', description: 'Confirm your availability for tours' },
      { title: 'Respond to tour request', description: 'Respond to buyer tour requests' },
    ];

    for (const task of buyerTasks) {
      await supabaseClient
        .from('tasks')
        .insert({
          deal_room_id: dealRoom.id,
          assignee_profile_id: params.buyerId,
          title: task.title,
          description: task.description,
          status: 'todo',
        });
    }

    for (const task of sellerTasks) {
      await supabaseClient
        .from('tasks')
        .insert({
          deal_room_id: dealRoom.id,
          assignee_profile_id: params.sellerId,
          title: task.title,
          description: task.description,
          status: 'todo',
        });
    }

    return { matched: true, dealRoomId: dealRoom.id };
  } catch (error) {
    console.error('Error creating match:', error);
    return { matched: false, dealRoomId: null };
  }
}
