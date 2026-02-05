// services/scheduleService.ts
// Appointment scheduling and QR generation
import { supabase } from './supabaseClient';
import type { Appointment } from '../src/types/types';
import { logActivity } from './activityLogService';
// Note: In production, use crypto.randomBytes for QR token generation

export interface CreateAppointmentInput {
  related_match_id?: string;
  offer_room_id?: string;
  scheduled_time: string;
  location?: string;
}

/**
 * Generate a unique QR token for an appointment
 */
function generateQRToken(): string {
  // Generate a random token (in production, use crypto.randomBytes)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create an appointment
 */
export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const qrToken = generateQRToken();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      creator_id: user.id,
      related_match_id: input.related_match_id ?? null,
      offer_room_id: input.offer_room_id ?? null,
      scheduled_time: input.scheduled_time,
      location: input.location ?? null,
      qr_token: qrToken,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'appointment',
    entity_id: data.id,
    action: 'created_appointment',
    meta: {
      scheduled_time: input.scheduled_time,
      qr_token: qrToken,
    },
  });

  return data;
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(appointmentId: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get appointment by QR token
 */
export async function getAppointmentByQRToken(qrToken: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('qr_token', qrToken)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get appointments for current user
 */
export async function getMyAppointments(): Promise<Appointment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('creator_id', user.id)
    .order('scheduled_time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  appointmentId: string,
  input: Partial<CreateAppointmentInput>
): Promise<Appointment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('appointments')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .eq('creator_id', user.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Appointment not found or access denied');

  await logActivity({
    entity_type: 'appointment',
    entity_id: appointmentId,
    action: 'updated_appointment',
  });

  return data;
}

