// supabase/functions/ai-generate-tasks/index.ts
// Generate tasks from workflow templates based on stage

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { deal_id, listing_post_id, stage } = await req.json();

    if (!stage) {
      return new Response(
        JSON.stringify({ error: 'Stage is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deal_id && !listing_post_id) {
      return new Response(
        JSON.stringify({ error: 'Either deal_id or listing_post_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get workflow templates for this stage
    const { data: templates, error: templatesError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('stage', stage)
      .order('created_at', { ascending: true });

    if (templatesError) throw templatesError;

    if (!templates || templates.length === 0) {
      return new Response(
        JSON.stringify({ tasks: [], message: 'No templates found for this stage' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing tasks to avoid duplicates
    const existingQuery = deal_id
      ? supabase.from('tasks').select('title').eq('deal_id', deal_id).eq('context_type', 'deal')
      : supabase.from('tasks').select('title').eq('listing_post_id', listing_post_id).eq('context_type', 'listing');

    const { data: existingTasks } = await existingQuery;
    const existingTitles = new Set((existingTasks ?? []).map((t: any) => t.title));

    // Create tasks from templates
    const createdTasks = [];
    const taskMap = new Map<string, any>(); // title -> task for dependency resolution

    for (const template of templates) {
      // Skip if task already exists
      if (existingTitles.has(template.title)) {
        continue;
      }

      // Calculate due_at if due_in_days is specified
      let due_at: string | null = null;
      if (template.due_in_days) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + template.due_in_days);
        due_at = dueDate.toISOString();
      }

      // Resolve dependencies
      const dependencyIds: string[] = [];
      if (template.dependency_titles && template.dependency_titles.length > 0) {
        const depQuery = deal_id
          ? supabase.from('tasks').select('id, title').eq('deal_id', deal_id).in('title', template.dependency_titles)
          : supabase.from('tasks').select('id, title').eq('listing_post_id', listing_post_id).in('title', template.dependency_titles);

        const { data: depTasks } = await depQuery;

        if (depTasks) {
          for (const depTitle of template.dependency_titles) {
            const inMemoryTask = taskMap.get(depTitle);
            if (inMemoryTask) {
              dependencyIds.push(inMemoryTask.id);
            } else {
              const depTask = depTasks.find((t: any) => t.title === depTitle);
              if (depTask) {
                dependencyIds.push(depTask.id);
              }
            }
          }
        }
      }

      // Create the task
      const taskData: any = {
        context_type: deal_id ? 'deal' : 'listing',
        assigned_role: template.assigned_role,
        title: template.title,
        description: template.description,
        due_at,
        dependencies: dependencyIds,
        status: 'pending',
        ai_generated: true,
      };

      if (deal_id) {
        taskData.deal_id = deal_id;
      } else {
        taskData.listing_post_id = listing_post_id;
      }

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        continue; // Skip this task but continue with others
      }

      createdTasks.push(task);
      taskMap.set(template.title, task);
    }

    return new Response(
      JSON.stringify({ 
        tasks: createdTasks,
        count: createdTasks.length,
        message: `Generated ${createdTasks.length} tasks from templates`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in ai-generate-tasks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

