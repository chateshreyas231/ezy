// Ezriya Platform - AI Summary Edge Function
// Generates AI-powered summaries (optional, falls back to deterministic)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { text, type } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (openaiKey) {
      // Use OpenAI for enhanced summaries
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
                content: `You are a helpful assistant that creates concise, friendly summaries for real estate matchmaking. Keep summaries under 100 words.`,
              },
              {
                role: 'user',
                content: `Create a summary for this ${type || 'content'}: ${text}`,
              },
            ],
            max_tokens: 150,
          }),
        });

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content || generateDeterministicSummary(text);

        return new Response(
          JSON.stringify({ summary }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('OpenAI error:', error);
        // Fall through to deterministic
      }
    }

    // Deterministic fallback
    const summary = generateDeterministicSummary(text);

    return new Response(
      JSON.stringify({ summary }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function generateDeterministicSummary(text: string): string {
  // Simple deterministic summary: first 100 characters + ellipsis
  if (text.length <= 100) {
    return text;
  }
  return text.substring(0, 97) + '...';
}
