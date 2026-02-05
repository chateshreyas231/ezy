// supabase/functions/score-lead/index.ts
// AI function to score property matches and generate explanations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { need, listing, buyerVerification } = await req.json();

    if (!need || !listing) {
      return new Response(
        JSON.stringify({ error: 'Need and listing are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let score = 0;
    const reasons: string[] = [];

    // Calculate base score based on criteria matching
    let matchCount = 0;
    let totalCriteria = 0;

    // City match
    if (need.city) {
      totalCriteria++;
      if (listing.city && listing.city.toLowerCase() === need.city.toLowerCase()) {
        matchCount++;
        reasons.push(`located in ${listing.city}`);
      }
    }

    // Price match
    if (need.price_max) {
      totalCriteria++;
      if (listing.list_price <= need.price_max) {
        matchCount++;
        const priceDiff = ((need.price_max - listing.list_price) / need.price_max) * 100;
        if (priceDiff > 20) {
          reasons.push('well below your budget');
        } else {
          reasons.push('within your budget');
        }
      }
    }

    // Beds match
    if (need.beds) {
      totalCriteria++;
      if (listing.beds && listing.beds >= need.beds) {
        matchCount++;
        reasons.push(`has ${listing.beds} bedrooms`);
      }
    }

    // Property type match
    if (need.property_type) {
      totalCriteria++;
      if (listing.property_type && listing.property_type.toLowerCase() === need.property_type.toLowerCase()) {
        matchCount++;
        reasons.push(`matches your preferred property type`);
      }
    }

    // Calculate score
    if (totalCriteria > 0) {
      score = Math.round((matchCount / totalCriteria) * 100);
    } else {
      score = 50; // Default score if no criteria
    }

    // Boost score for verified buyers
    if (buyerVerification >= 2) {
      score = Math.min(100, score + 5);
    }

    // Generate explanation
    let explanation = '';
    if (reasons.length > 0) {
      explanation = `High match: ${reasons.join(', ')}.`;
    } else if (score >= 80) {
      explanation = 'This property closely matches your criteria.';
    } else if (score >= 60) {
      explanation = 'This property partially matches your criteria.';
    } else {
      explanation = 'This property has some matching features.';
    }

    return new Response(
      JSON.stringify({ score, explanation }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

