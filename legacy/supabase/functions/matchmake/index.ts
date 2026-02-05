// supabase/functions/matchmake/index.ts
// Edge Function: Match buyer intent with listings
// Returns ranked list of listing_ids with match scores

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuyerIntent {
  id: string;
  buyer_id: string;
  budget_min: number | null;
  budget_max: number | null;
  beds_min: number | null;
  baths_min: number | null;
  property_types: string[];
  must_haves: string[];
  dealbreakers: string[];
  areas: any;
  commute_anchors: any;
}

interface Listing {
  id: string;
  seller_id: string;
  price: number;
  beds: number | null;
  baths: number | null;
  property_type: string | null;
  features: string[];
  lat: number | null;
  lng: number | null;
  status: string;
  listing_verified: boolean;
}

interface MatchResult {
  listing_id: string;
  match_score: number;
  commute_estimate_minutes: number | null;
  reasons: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { buyer_intent_id } = await req.json();

    if (!buyer_intent_id) {
      return new Response(
        JSON.stringify({ error: 'buyer_intent_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch buyer intent
    const { data: intent, error: intentError } = await supabaseClient
      .from('buyer_intents')
      .select('*')
      .eq('id', buyer_intent_id)
      .eq('active', true)
      .single();

    if (intentError || !intent) {
      return new Response(
        JSON.stringify({ error: 'Buyer intent not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch active, verified listings
    const { data: listings, error: listingsError } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .eq('listing_verified', true);

    if (listingsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch listings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Score each listing
    const scoredMatches: MatchResult[] = listings.map((listing: Listing) => {
      let score = 0;
      const reasons: string[] = [];

      // Price match (big weight: 40 points)
      if (intent.budget_min && intent.budget_max) {
        if (listing.price >= intent.budget_min && listing.price <= intent.budget_max) {
          score += 40;
          reasons.push('Price within budget');
        } else if (listing.price < intent.budget_min) {
          score += 20;
          reasons.push('Price below budget');
        } else if (listing.price <= intent.budget_max * 1.1) {
          score += 15;
          reasons.push('Price slightly above budget');
        } else {
          score -= 10;
          reasons.push('Price significantly above budget');
        }
      }

      // Beds match (weight: 15 points)
      if (intent.beds_min && listing.beds) {
        if (listing.beds >= intent.beds_min) {
          score += 15;
          reasons.push(`Meets ${intent.beds_min}+ beds requirement`);
        } else {
          score -= 5;
          reasons.push(`Fewer beds than required`);
        }
      }

      // Baths match (weight: 10 points)
      if (intent.baths_min && listing.baths) {
        if (listing.baths >= intent.baths_min) {
          score += 10;
          reasons.push(`Meets ${intent.baths_min}+ baths requirement`);
        } else {
          score -= 3;
          reasons.push(`Fewer baths than required`);
        }
      }

      // Property type match (weight: 15 points)
      if (intent.property_types.length > 0 && listing.property_type) {
        if (intent.property_types.includes(listing.property_type)) {
          score += 15;
          reasons.push(`Matches property type: ${listing.property_type}`);
        } else {
          score -= 5;
          reasons.push(`Property type mismatch`);
        }
      }

      // Must haves overlap (weight: 10 points per match)
      if (intent.must_haves.length > 0 && listing.features.length > 0) {
        const matches = intent.must_haves.filter(mh => 
          listing.features.some(f => f.toLowerCase().includes(mh.toLowerCase()))
        );
        score += matches.length * 10;
        if (matches.length > 0) {
          reasons.push(`Has ${matches.length} must-have feature(s)`);
        }
      }

      // Dealbreakers check (heavy penalty: -50 points)
      if (intent.dealbreakers.length > 0 && listing.features.length > 0) {
        const hasDealbreaker = intent.dealbreakers.some(db =>
          listing.features.some(f => f.toLowerCase().includes(db.toLowerCase()))
        );
        if (hasDealbreaker) {
          score -= 50;
          reasons.push('Contains dealbreaker');
        }
      }

      // Commute score (stub implementation - 10 points if within range)
      let commuteEstimate: number | null = null;
      if (intent.commute_anchors && Object.keys(intent.commute_anchors).length > 0 && listing.lat && listing.lng) {
        // Stub: approximate using straight-line distance
        // In production, use Google Maps API or similar
        const anchor = Object.values(intent.commute_anchors)[0] as any;
        if (anchor.lat && anchor.lng) {
          const distanceKm = calculateDistance(
            anchor.lat,
            anchor.lng,
            listing.lat,
            listing.lng
          );
          commuteEstimate = Math.round(distanceKm * 1.5); // Rough estimate: 1.5 min per km
          
          if (anchor.max_minutes && commuteEstimate <= anchor.max_minutes) {
            score += 10;
            reasons.push(`Commute within ${anchor.max_minutes} minutes`);
          } else if (anchor.max_minutes) {
            score -= 5;
            reasons.push(`Commute exceeds ${anchor.max_minutes} minutes`);
          }
        }
      }

      // Normalize score to 0-1 range
      const normalizedScore = Math.max(0, Math.min(1, score / 100));

      return {
        listing_id: listing.id,
        match_score: normalizedScore,
        commute_estimate_minutes: commuteEstimate,
        reasons,
      };
    });

    // Sort by score (highest first)
    scoredMatches.sort((a, b) => b.match_score - a.match_score);

    return new Response(
      JSON.stringify({ matches: scoredMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Calculate distance between two lat/lng points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

