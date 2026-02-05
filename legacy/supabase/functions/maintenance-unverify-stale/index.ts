// supabase/functions/maintenance-unverify-stale/index.ts
// Daily job to unverify stale listings

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Days threshold (default 30 days)
    const staleDays = parseInt(Deno.env.get('STALE_LISTING_DAYS') || '30', 10);
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - staleDays);

    // Find verified listings that haven't been verified recently
    const { data: staleListings, error: findError } = await supabase
      .from('listing_posts')
      .select('id, verified, last_verified_at, listing_status')
      .eq('verified', true)
      .or(`last_verified_at.is.null,last_verified_at.lt.${staleDate.toISOString()}`);

    if (findError) throw findError;

    if (!staleListings || staleListings.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No stale listings found',
          count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unverify stale listings
    const { data: updated, error: updateError } = await supabase
      .from('listing_posts')
      .update({
        verified: false,
        listing_status: 'stale',
      })
      .in('id', staleListings.map(l => l.id))
      .select('id');

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        message: `Unverified ${updated?.length || 0} stale listings`,
        count: updated?.length || 0,
        listing_ids: updated?.map(l => l.id) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in maintenance-unverify-stale:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

