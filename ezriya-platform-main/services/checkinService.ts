// services/checkinService.ts
// QR check-in logic
import { supabase } from './supabaseClient';
import type { Checkin } from '../src/types/types';
import { logActivity } from './activityLogService';

export interface CreateCheckinInput {
  appointment_id: string;
  location_snapshot?: Record<string, any>;
}

/**
 * Create a check-in for an appointment
 */
export async function createCheckin(input: CreateCheckinInput): Promise<Checkin> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already checked in
  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('appointment_id', input.appointment_id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Return existing check-in
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('id', existing.id)
      .single();
    if (data) return data;
  }

  const { data, error } = await supabase
    .from('checkins')
    .insert({
      appointment_id: input.appointment_id,
      user_id: user.id,
      location_snapshot: input.location_snapshot ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'checkin',
    entity_id: data.id,
    action: 'checked_in',
    meta: {
      appointment_id: input.appointment_id,
    },
  });

  return data;
}

/**
 * Get check-ins for an appointment
 */
export async function getCheckinsForAppointment(appointmentId: string): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('checked_in_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Check if user has checked in to an appointment
 */
export async function hasCheckedIn(appointmentId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('checkins')
    .select('id')
    .eq('appointment_id', appointmentId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    throw error;
  }

  return !!data;
}

