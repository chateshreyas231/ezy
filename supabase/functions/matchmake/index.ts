// Ezriya Platform - Matchmake Edge Function
// Scores and ranks listings for a buyer intent

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LISTING_FRESHNESS_DAYS = 7;

interface BuyerIntent {
  id: string;
  buyer_id: string;
  budget_min: number;
  budget_max: number;
  beds_min: number;
  baths_min: number;
  property_types: string[];
  must_haves: string[];
  dealbreakers: string[];
  areas: any;
  commute_anchors: any[];
}

interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  property_type: string;
  features: string[];
}

interface ListingCard {
  listing: Listing;
  media: any[];
  score: number;
  explanation: string;
  commute_est_minutes?: number;
}

serve(async (req) => {
  try {
    const { buyer_intent_id } = await req.json();

    if (!buyer_intent_id) {
      return new Response(
        JSON.stringify({ error: 'buyer_intent_id is required' }),
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

    // Get buyer intent
    const { data: intent, error: intentError } = await supabaseClient
      .from('buyer_intents')
      .select('*')
      .eq('id', buyer_intent_id)
      .single();

    if (intentError || !intent) {
      return new Response(
        JSON.stringify({ error: 'Buyer intent not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get active, verified listings within freshness window
    const freshnessDate = new Date();
    freshnessDate.setDate(freshnessDate.getDate() - LISTING_FRESHNESS_DAYS);

    const { data: listings, error: listingsError } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .eq('listing_verified', true)
      .or(`freshness_verified_at.is.null,freshness_verified_at.gt.${freshnessDate.toISOString()}`)
      .limit(100);

    if (listingsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch listings' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Score each listing
    const scoredListings: ListingCard[] = [];

    for (const listing of listings || []) {
      const score = calculateScore(intent as BuyerIntent, listing);
      const explanation = generateExplanation(intent as BuyerIntent, listing, score);
      const commuteEst = calculateCommute(intent as BuyerIntent, listing);

      // Get listing media
      const { data: media } = await supabaseClient
        .from('listing_media')
        .select('*')
        .eq('listing_id', listing.id)
        .order('order_index', { ascending: true });

      scoredListings.push({
        listing,
        media: media || [],
        score,
        explanation,
        commute_est_minutes: commuteEst,
      });
    }

    // Sort by score (highest first)
    scoredListings.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify(scoredListings),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function calculateScore(intent: BuyerIntent, listing: Listing): number {
  let score = 0;
  const weights = {
    budget: 0.3,
    bedsBaths: 0.2,
    propertyType: 0.2,
    mustHaves: 0.15,
    dealbreakers: -0.5, // Heavy negative
    commute: 0.15,
  };

  // Budget fit (0-1)
  if (listing.price >= intent.budget_min && listing.price <= intent.budget_max) {
    score += weights.budget * 1.0;
  } else if (listing.price < intent.budget_min) {
    score += weights.budget * 0.5; // Below budget is okay
  } else {
    const overage = (listing.price - intent.budget_max) / intent.budget_max;
    score += weights.budget * Math.max(0, 1 - overage * 2); // Penalize going over
  }

  // Beds/Baths fit (0-1)
  const bedsFit = listing.beds >= intent.beds_min ? 1 : listing.beds / intent.beds_min;
  const bathsFit = listing.baths >= intent.baths_min ? 1 : listing.baths / intent.baths_min;
  score += weights.bedsBaths * (bedsFit + bathsFit) / 2;

  // Property type match (0-1)
  if (intent.property_types.length === 0 || intent.property_types.includes(listing.property_type)) {
    score += weights.propertyType * 1.0;
  }

  // Must haves overlap (0-1)
  if (intent.must_haves.length > 0) {
    const matches = intent.must_haves.filter(mh =>
      listing.features.some(f => f.toLowerCase().includes(mh.toLowerCase()))
    );
    score += weights.mustHaves * (matches.length / intent.must_haves.length);
  }

  // Dealbreakers (heavy negative)
  const hasDealbreaker = intent.dealbreakers.some(db =>
    listing.features.some(f => f.toLowerCase().includes(db.toLowerCase())) ||
    listing.description?.toLowerCase().includes(db.toLowerCase())
  );
  if (hasDealbreaker) {
    score += weights.dealbreakers;
  }

  // Commute (0-1, if anchors exist)
  if (intent.commute_anchors && intent.commute_anchors.length > 0) {
    const commuteScore = calculateCommuteScore(intent, listing);
    score += weights.commute * commuteScore;
  }

  return Math.max(0, Math.min(1, score)); // Clamp to 0-1
}

function calculateCommute(intent: BuyerIntent, listing: Listing): number | undefined {
  if (!intent.commute_anchors || intent.commute_anchors.length === 0) {
    return undefined;
  }

  // Simple haversine distance calculation
  // In production, use a proper routing API
  const avgSpeed = 30; // mph
  let totalMinutes = 0;

  for (const anchor of intent.commute_anchors) {
    const distance = haversineDistance(
      anchor.lat,
      anchor.lng,
      listing.lat,
      listing.lng
    );
    const minutes = (distance / avgSpeed) * 60;
    totalMinutes += minutes;
  }

  return Math.round(totalMinutes / intent.commute_anchors.length);
}

function calculateCommuteScore(intent: BuyerIntent, listing: Listing): number {
  const commuteEst = calculateCommute(intent, listing);
  if (!commuteEst) return 0.5; // Neutral if no commute data

  // Get max minutes from anchors
  const maxMinutes = Math.max(...intent.commute_anchors.map((a: any) => a.max_minutes || 60));

  if (commuteEst <= maxMinutes) {
    return 1.0 - (commuteEst / maxMinutes) * 0.5; // 0.5 to 1.0
  } else {
    return Math.max(0, 0.5 - (commuteEst - maxMinutes) / maxMinutes); // Penalize over limit
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateExplanation(intent: BuyerIntent, listing: Listing, score: number): string {
  const parts: string[] = [];

  // Budget
  if (listing.price >= intent.budget_min && listing.price <= intent.budget_max) {
    parts.push('Budget fit');
  } else if (listing.price < intent.budget_min) {
    parts.push('Below budget');
  }

  // Commute
  const commuteEst = calculateCommute(intent, listing);
  if (commuteEst) {
    parts.push(`${commuteEst} min commute estimate`);
  }

  // Features
  if (intent.must_haves.length > 0) {
    const matches = intent.must_haves.filter(mh =>
      listing.features.some(f => f.toLowerCase().includes(mh.toLowerCase()))
    );
    if (matches.length > 0) {
      parts.push(`Has ${matches.join(', ')}`);
    }
  }

  // Property type
  if (intent.property_types.length === 0 || intent.property_types.includes(listing.property_type)) {
    parts.push(`${listing.property_type} match`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Match found';
}
