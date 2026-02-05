// supabase/functions/maintenance-overdue-tasks/index.ts
// Daily job to notify users about overdue tasks

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

    const now = new Date().toISOString();

    // Find overdue tasks (pending tasks with due_at in the past)
    const { data: overdueTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        due_at,
        assigned_role,
        context_type,
        listing_post_id,
        deal_id,
        users!tasks_assigned_role_fkey(push_token, role)
      `)
      .eq('status', 'pending')
      .lt('due_at', now)
      .not('due_at', 'is', null);

    if (tasksError) throw tasksError;

    if (!overdueTasks || overdueTasks.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No overdue tasks found',
          count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group tasks by user role and collect push tokens
    const notifications: Array<{
      push_token: string;
      role: string;
      task_count: number;
      task_titles: string[];
    }> = [];

    const roleMap = new Map<string, Set<string>>(); // role -> set of push tokens

    for (const task of overdueTasks) {
      // Get users with this role and push tokens
      const { data: users } = await supabase
        .from('users')
        .select('id, push_token, role')
        .eq('role', task.assigned_role)
        .not('push_token', 'is', null);

      if (users) {
        for (const user of users) {
          if (!user.push_token) continue;

          const key = `${user.role}:${user.push_token}`;
          if (!roleMap.has(key)) {
            roleMap.set(key, new Set());
          }
          roleMap.get(key)!.add(task.title);
        }
      }
    }

    // Build notification list
    for (const [key, taskTitles] of roleMap.entries()) {
      const [role, push_token] = key.split(':');
      notifications.push({
        push_token,
        role,
        task_count: taskTitles.size,
        task_titles: Array.from(taskTitles),
      });
    }

    // In a real implementation, you would send push notifications here
    // For now, we'll just return the notification data
    // You can integrate with Expo Push Notification service or similar

    return new Response(
      JSON.stringify({
        message: `Found ${overdueTasks.length} overdue tasks`,
        task_count: overdueTasks.length,
        notification_count: notifications.length,
        notifications: notifications.map(n => ({
          role: n.role,
          task_count: n.task_count,
          // Don't expose push tokens in response
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in maintenance-overdue-tasks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

