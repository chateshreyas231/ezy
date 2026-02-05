// services/tasksService.ts
// Task management and workflow orchestration
import { supabase } from './supabaseClient';
import { logActivity } from './activityLogService';
import type { Task } from '../src/types/types';

/**
 * Get tasks for the current user based on their role
 */
export async function getMyTasks(): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userProfile?.role || 'buyer';

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_role', role)
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get tasks for a specific listing
 */
export async function getTasksForListing(listingPostId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('listing_post_id', listingPostId)
    .eq('context_type', 'listing')
    .order('due_at', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get tasks for a specific deal
 */
export async function getTasksForDeal(dealId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('deal_id', dealId)
    .eq('context_type', 'deal')
    .order('due_at', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get tasks for a specific offer room (legacy support)
 */
export async function getTasksForOfferRoom(offerRoomId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('offer_room_id', offerRoomId)
    .order('due_at', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new task
 */
export async function createTask(task: {
  context_type: 'listing' | 'deal';
  listing_post_id?: string;
  deal_id?: string;
  offer_room_id?: string; // Legacy support
  assigned_role: string;
  title: string;
  description?: string;
  due_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  ai_generated?: boolean;
  dependencies?: string[];
}): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      context_type: task.context_type,
      listing_post_id: task.context_type === 'listing' ? task.listing_post_id : null,
      deal_id: task.context_type === 'deal' ? task.deal_id : null,
      offer_room_id: task.offer_room_id || null,
      assigned_role: task.assigned_role,
      title: task.title,
      description: task.description || null,
      due_at: task.due_at || null,
      status: task.status || 'pending',
      ai_generated: task.ai_generated ?? false,
      dependencies: task.dependencies ?? [],
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'task',
    entity_id: data.id,
    action: 'task_created',
    meta: { 
      assigned_role: task.assigned_role, 
      ai_generated: task.ai_generated,
      context_type: task.context_type,
    },
  });

  return data;
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: Task['status']
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'task',
    entity_id: taskId,
    action: `task_${status}`,
  });

  return data;
}

/**
 * Mark task as completed
 */
export async function completeTask(taskId: string): Promise<Task> {
  return updateTaskStatus(taskId, 'completed');
}

/**
 * Update task (general update)
 */
export async function updateTask(
  taskId: string,
  updates: Partial<{
    title: string;
    description: string;
    due_at: string;
    status: Task['status'];
    assigned_role: string;
  }>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'task',
    entity_id: taskId,
    action: 'task_updated',
    meta: updates,
  });

  return data;
}

/**
 * Create multiple tasks (for AI-generated task lists)
 */
export async function createTasks(tasks: Array<{
  context_type: 'listing' | 'deal';
  listing_post_id?: string;
  deal_id?: string;
  assigned_role: string;
  title: string;
  description?: string;
  due_at?: string;
  dependencies?: string[];
}>): Promise<Task[]> {
  const tasksWithDefaults = tasks.map(task => ({
    context_type: task.context_type,
    listing_post_id: task.context_type === 'listing' ? task.listing_post_id : null,
    deal_id: task.context_type === 'deal' ? task.deal_id : null,
    assigned_role: task.assigned_role,
    title: task.title,
    description: task.description || null,
    due_at: task.due_at || null,
    status: 'pending' as const,
    ai_generated: true,
    dependencies: task.dependencies ?? [],
  }));

  const { data, error } = await supabase
    .from('tasks')
    .insert(tasksWithDefaults)
    .select();

  if (error) throw error;

  // Log activity for each task
  for (const task of data) {
    await logActivity({
      entity_type: 'task',
      entity_id: task.id,
      action: 'task_created',
      meta: { 
        assigned_role: task.assigned_role, 
        ai_generated: true,
        context_type: task.context_type,
      },
    });
  }

  return data ?? [];
}

/**
 * Get overdue tasks for the current user
 */
export async function getOverdueTasks(): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userProfile?.role || 'buyer';

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_role', role)
    .eq('status', 'pending')
    .lt('due_at', now)
    .order('due_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
