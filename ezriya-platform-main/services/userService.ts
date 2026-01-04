// services/userService.ts
// User CRUD and profile management
import { supabase } from './supabaseClient';
import type { User, Role } from '../src/types/types';

export interface CreateUserInput {
  email?: string;
  name?: string;
  phone?: string;
  role?: Role;
  state?: string;
  is_verified_agent?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  role?: Role;
  state?: string;
  is_verified_agent?: boolean;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Create or update user profile
 * Called after auth signup/login
 */
export async function upsertUser(input: CreateUserInput): Promise<User> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: input.email ?? user.email ?? null,
        name: input.name ?? null,
        phone: input.phone ?? null,
        role: input.role ?? 'buyer',
        state: input.state ?? null,
        is_verified_agent: input.is_verified_agent ?? false,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 */
export async function updateUser(input: UpdateUserInput): Promise<User> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .update(input)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's basic info (for contact purposes)
 */
export async function getUserBasicInfo(userId: string): Promise<Pick<User, 'id' | 'name' | 'email' | 'phone'> | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

