// supabase/functions/ai-summary/index.ts
// Edge Function: Generate AI summaries for listings and matches
// Uses OpenAI if available, otherwise returns deterministic summaries

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummaryRequest {
  type: 'listing' | 'match';
  listing_id?: string;
  match_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, listing_id, match_id }: SummaryRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (type === 'listing' && listing_id) {
      const { data: listing, error } = await supabaseClient
        .from('listings')
        .select('*')
        .eq('id', listing_id)
        .single();

      if (error || !listing) {
        return new Response(
          JSON.stringify({ error: 'Listing not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (openaiKey) {
        // Use OpenAI for AI summary
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a real estate assistant. Generate a concise, appealing summary of this property listing in bullet points.',
                },
                {
                  role: 'user',
                  content: `Property: ${listing.title}\nDescription: ${listing.description || 'No description'}\nPrice: $${listing.price.toLocaleString()}\nBeds: ${listing.beds || 'N/A'}, Baths: ${listing.baths || 'N/A'}\nFeatures: ${listing.features.join(', ')}`,
                },
              ],
              max_tokens: 200,
            }),
          });

          const data = await response.json();
          const aiSummary = data.choices?.[0]?.message?.content || '';

          return new Response(
            JSON.stringify({
              summary: aiSummary.split('\n').filter((line: string) => line.trim()),
              source: 'openai',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (openaiError) {
          console.error('OpenAI error:', openaiError);
          // Fall through to deterministic summary
        }
      }

      // Deterministic summary (fallback)
      const summary = [
        `$${listing.price.toLocaleString()} ${listing.property_type || 'Property'}`,
        listing.beds ? `${listing.beds} bed${listing.beds > 1 ? 's' : ''}` : '',
        listing.baths ? `${listing.baths} bath${listing.baths > 1 ? 's' : ''}` : '',
        listing.sqft ? `${listing.sqft.toLocaleString()} sqft` : '',
        listing.features.length > 0 ? `Features: ${listing.features.slice(0, 3).join(', ')}` : '',
      ].filter(Boolean);

      return new Response(
        JSON.stringify({
          summary,
          source: 'deterministic',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'match' && match_id) {
      const { data: match, error: matchError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          listing:listings(*),
          buyer:profiles!matches_buyer_id_fkey(*),
          buyer_intent:buyer_intents(*)
        `)
        .eq('id', match_id)
        .single();

      if (matchError || !match) {
        return new Response(
          JSON.stringify({ error: 'Match not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (openaiKey) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a real estate assistant. Explain why this buyer and listing are a good match in bullet points.',
                },
                {
                  role: 'user',
                  content: `Buyer wants: ${JSON.stringify(match.buyer_intent)}\nListing: ${JSON.stringify(match.listing)}\nMatch Score: ${match.match_score}`,
                },
              ],
              max_tokens: 200,
            }),
          });

          const data = await response.json();
          const aiSummary = data.choices?.[0]?.message?.content || '';

          return new Response(
            JSON.stringify({
              why_match: aiSummary.split('\n').filter((line: string) => line.trim()),
              source: 'openai',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (openaiError) {
          console.error('OpenAI error:', openaiError);
        }
      }

      // Deterministic "why match" summary
      const whyMatch = [
        `Match score: ${(match.match_score * 100).toFixed(0)}%`,
        match.listing?.price && match.buyer_intent?.budget_max
          ? `Price within budget ($${match.listing.price.toLocaleString()} vs $${match.buyer_intent.budget_max.toLocaleString()} max)`
          : '',
        match.listing?.beds && match.buyer_intent?.beds_min
          ? `Meets ${match.buyer_intent.beds_min}+ beds requirement`
          : '',
      ].filter(Boolean);

      return new Response(
        JSON.stringify({
          why_match: whyMatch,
          source: 'deterministic',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

