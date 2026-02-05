// services/activityLogService.ts
// Activity logging for compliance audit trail
import { supabase } from './supabaseClient';
import type { ActivityLog } from '../src/types/types';

export interface LogActivityInput {
  user_id?: string | null;
  entity_type: string;
  entity_id?: string | null;
  action: string;
  meta?: Record<string, any>;
}

/**
 * Log an activity
 */
export async function logActivity(input: LogActivityInput): Promise<ActivityLog> {
  // Get current user if not provided
  let userId = input.user_id;
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      action: input.action,
      meta: input.meta ?? {},
    })
    .select()
    .single();

  if (error) {
    // Don't throw - logging failures shouldn't break the app
    console.error('Failed to log activity:', error);
    throw error;
  }

  return data;
}

/**
 * Get activity logs for current user
 */
export async function getMyActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Get activity logs for an entity
 */
export async function getEntityActivityLogs(
  entityType: string,
  entityId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

