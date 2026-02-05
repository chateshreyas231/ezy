// supabase/functions/suggest-tasks/index.ts
// AI function to suggest tasks based on deal stage

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { type, stage, roles } = await req.json();

    if (!type || !stage) {
      return new Response(
        JSON.stringify({ error: 'Type and stage are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tasks: Array<{ role: string; title: string; due_in_days?: number }> = [];

    if (type === 'listing') {
      // Pre-listing tasks
      tasks.push(
        { role: 'agent', title: 'Order professional photography', due_in_days: 3 },
        { role: 'agent', title: 'Complete property disclosure form', due_in_days: 5 },
        { role: 'seller', title: 'Stage the home for viewing', due_in_days: 7 }
      );
    } else if (type === 'deal') {
      if (stage === 'offer_accepted' || stage === 'under_contract') {
        tasks.push(
          { role: 'buyer', title: 'Deliver earnest money deposit', due_in_days: 3 },
          { role: 'buyer', title: 'Schedule home inspection', due_in_days: 7 },
          { role: 'seller', title: 'Provide property disclosures', due_in_days: 5 },
          { role: 'agent', title: 'Open escrow account', due_in_days: 2 },
          { role: 'agent', title: 'Coordinate home inspection', due_in_days: 7 }
        );

        if (roles?.includes('lawyer')) {
          tasks.push({ role: 'lawyer', title: 'Review purchase contract', due_in_days: 5 });
        }
        if (roles?.includes('inspector')) {
          tasks.push({ role: 'inspector', title: 'Conduct home inspection', due_in_days: 10 });
        }
      } else if (stage === 'closing') {
        tasks.push(
          { role: 'buyer', title: 'Arrange final walkthrough', due_in_days: 2 },
          { role: 'buyer', title: 'Secure final financing approval', due_in_days: 5 },
          { role: 'seller', title: 'Complete all repairs', due_in_days: 3 },
          { role: 'agent', title: 'Schedule closing meeting', due_in_days: 1 }
        );
      }
    }

    return new Response(
      JSON.stringify({ tasks }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

