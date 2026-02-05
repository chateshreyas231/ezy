// supabase/functions/summarize-document/index.ts
// AI function to summarize documents

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

    // Simple summarization (first 200 words)
    // In production, this would use OpenAI API for better summarization
    const words = text.split(/\s+/);
    const summary = words.slice(0, 200).join(' ') + (words.length > 200 ? '...' : '');

    return new Response(
      JSON.stringify({ summary }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

