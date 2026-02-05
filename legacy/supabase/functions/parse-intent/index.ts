// supabase/functions/parse-intent/index.ts
// AI function to parse buyer intent text into structured criteria

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Simple keyword-based parsing (can be enhanced with OpenAI API)
    const criteria: any = {};

    // Extract city
    const cityMatch = text.match(/\b(in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/i);
    if (cityMatch) {
      criteria.city = cityMatch[2];
    }

    // Extract price
    const priceMatch = text.match(/\$?(\d{1,3}(?:,\d{3})*(?:k|K|000)?)/);
    if (priceMatch) {
      let price = priceMatch[1].replace(/,/g, '');
      if (price.endsWith('k') || price.endsWith('K')) {
        price = price.slice(0, -1) + '000';
      }
      criteria.price_max = parseInt(price);
    }

    // Extract bedrooms
    const bedsMatch = text.match(/\b(\d+)\s*(bed|bedroom|br|bdr)\b/i);
    if (bedsMatch) {
      criteria.beds = parseInt(bedsMatch[1]);
    }

    // Extract property type
    const propertyTypes = ['condo', 'house', 'apartment', 'townhouse', 'single-family', 'multi-family'];
    for (const type of propertyTypes) {
      if (text.toLowerCase().includes(type)) {
        criteria.property_type = type;
        break;
      }
    }

    // Extract features
    const features: string[] = [];
    if (text.toLowerCase().includes('backyard') || text.toLowerCase().includes('yard')) {
      features.push('backyard');
    }
    if (text.toLowerCase().includes('garage') || text.toLowerCase().includes('parking')) {
      features.push('garage');
    }
    if (features.length > 0) {
      criteria.features = features;
    }

    return new Response(
      JSON.stringify(criteria),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

