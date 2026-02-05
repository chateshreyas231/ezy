// services/workflowService.ts
// Workflow template and task generation service
import { supabase } from './supabaseClient';
import type { WorkflowTemplate, Task, DealStage } from '../src/types/types';
import { createTask } from './tasksService';

/**
 * Get workflow templates for a stage and role
 */
export async function getTemplatesForStage(
  stage: string,
  role?: string
): Promise<WorkflowTemplate[]> {
  let query = supabase
    .from('workflow_templates')
    .select('*')
    .eq('stage', stage);

  if (role) {
    query = query.eq('assigned_role', role);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all templates for a role
 */
export async function getTemplatesForRole(role: string): Promise<WorkflowTemplate[]> {
  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('assigned_role', role)
    .order('stage', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Generate tasks from workflow templates for a deal stage
 */
export async function generateTasksFromDealStage(
  dealId: string,
  stage: DealStage
): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get deal to find participants
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (dealError) throw dealError;
  if (!deal) throw new Error('Deal not found');

  // Get all templates for this stage
  const templates = await getTemplatesForStage(stage);

  if (templates.length === 0) {
    return [];
  }

  // Get existing tasks for this deal to avoid duplicates
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('title')
    .eq('deal_id', dealId)
    .eq('context_type', 'deal');

  const existingTitles = new Set((existingTasks ?? []).map(t => t.title));

  // Create tasks from templates
  const createdTasks: Task[] = [];
  const taskMap = new Map<string, Task>(); // title -> task for dependency resolution

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

    // Resolve dependencies by finding task IDs for dependency titles
    const dependencyIds: string[] = [];
    if (template.dependency_titles.length > 0) {
      const { data: depTasks } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('deal_id', dealId)
        .in('title', template.dependency_titles);

      if (depTasks) {
        // Also check in-memory tasks we just created
        for (const depTitle of template.dependency_titles) {
          const inMemoryTask = taskMap.get(depTitle);
          if (inMemoryTask) {
            dependencyIds.push(inMemoryTask.id);
          } else if (depTasks) {
            const depTask = depTasks.find(t => t.title === depTitle);
            if (depTask) {
              dependencyIds.push(depTask.id);
            }
          }
        }
      }
    }

    // Create the task
    const task = await createTask({
      context_type: 'deal',
      deal_id: dealId,
      assigned_role: template.assigned_role,
      title: template.title,
      description: template.description,
      due_at,
      dependencies: dependencyIds,
      ai_generated: true,
    });

    createdTasks.push(task);
    taskMap.set(template.title, task);
  }

  return createdTasks;
}

/**
 * Generate tasks from workflow templates for a listing stage
 */
export async function generateTasksFromListingStage(
  listingPostId: string,
  stage: string
): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get listing to verify ownership
  const { data: listing, error: listingError } = await supabase
    .from('listing_posts')
    .select('agent_id')
    .eq('id', listingPostId)
    .single();

  if (listingError) throw listingError;
  if (!listing || listing.agent_id !== user.id) {
    throw new Error('Not authorized to create tasks for this listing');
  }

  // Get templates for this stage
  const templates = await getTemplatesForStage(stage);

  if (templates.length === 0) {
    return [];
  }

  // Get existing tasks to avoid duplicates
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('title')
    .eq('listing_post_id', listingPostId)
    .eq('context_type', 'listing');

  const existingTitles = new Set((existingTasks ?? []).map(t => t.title));

  // Create tasks from templates
  const createdTasks: Task[] = [];
  const taskMap = new Map<string, Task>();

  for (const template of templates) {
    if (existingTitles.has(template.title)) {
      continue;
    }

    let due_at: string | null = null;
    if (template.due_in_days) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + template.due_in_days);
      due_at = dueDate.toISOString();
    }

    const dependencyIds: string[] = [];
    if (template.dependency_titles.length > 0) {
      const { data: depTasks } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('listing_post_id', listingPostId)
        .in('title', template.dependency_titles);

      if (depTasks) {
        for (const depTitle of template.dependency_titles) {
          const inMemoryTask = taskMap.get(depTitle);
          if (inMemoryTask) {
            dependencyIds.push(inMemoryTask.id);
          } else {
            const depTask = depTasks.find(t => t.title === depTitle);
            if (depTask) {
              dependencyIds.push(depTask.id);
            }
          }
        }
      }
    }

    const task = await createTask({
      context_type: 'listing',
      listing_post_id: listingPostId,
      assigned_role: template.assigned_role,
      title: template.title,
      description: template.description,
      due_at,
      dependencies: dependencyIds,
      ai_generated: true,
    });

    createdTasks.push(task);
    taskMap.set(template.title, task);
  }

  return createdTasks;
}

