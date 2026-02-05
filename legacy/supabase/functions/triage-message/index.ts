// supabase/functions/triage-message/index.ts
// AI function to classify conversation messages by intent

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

    const lowerText = text.toLowerCase();

    // Classify message intent
    let label = 'QUESTION';

    // Check for scheduling intent
    if (
      lowerText.includes('tour') ||
      lowerText.includes('viewing') ||
      lowerText.includes('schedule') ||
      lowerText.includes('visit') ||
      lowerText.includes('see') ||
      lowerText.includes('available') ||
      lowerText.includes('when can')
    ) {
      label = 'SCHEDULING';
    }
    // Check for offer intent
    else if (
      lowerText.includes('offer') ||
      lowerText.includes('bid') ||
      lowerText.includes('interested in making') ||
      lowerText.includes('want to buy') ||
      lowerText.includes('purchase')
    ) {
      label = 'OFFER';
    }
    // Check for general questions
    else if (
      lowerText.includes('?') ||
      lowerText.includes('how much') ||
      lowerText.includes('what') ||
      lowerText.includes('when') ||
      lowerText.includes('where') ||
      lowerText.includes('why')
    ) {
      label = 'QUESTION';
    }

    return new Response(
      JSON.stringify({ label }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

