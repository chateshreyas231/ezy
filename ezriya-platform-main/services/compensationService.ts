// services/compensationService.ts
// Compensation declaration logging
import { supabase } from './supabaseClient';
import type { CompensationDeclaration } from '../src/types/types';
import { logActivity } from './activityLogService';

export interface CreateCompensationInput {
  offer_room_id: string;
  role: string;
  description?: string;
}

/**
 * Create a compensation declaration
 */
export async function createCompensation(input: CreateCompensationInput): Promise<CompensationDeclaration> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('compensation_declarations')
    .insert({
      offer_room_id: input.offer_room_id,
      user_id: user.id,
      role: input.role,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'compensation_declaration',
    entity_id: data.id,
    action: 'declared_compensation',
    meta: {
      offer_room_id: input.offer_room_id,
      role: input.role,
    },
  });

  return data;
}

/**
 * Get compensation declarations for an offer room
 */
export async function getCompensationDeclarations(offerRoomId: string): Promise<CompensationDeclaration[]> {
  const { data, error } = await supabase
    .from('compensation_declarations')
    .select('*')
    .eq('offer_room_id', offerRoomId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

