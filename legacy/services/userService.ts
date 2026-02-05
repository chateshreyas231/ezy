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

  // Use profiles table (new schema)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    // If profile doesn't exist, create it
    if (error.code === 'PGRST116') {
      return await upsertUser({ role: 'buyer' });
    }
    throw error;
  }
  
  // Map profiles table to User type
  // Note: profiles table doesn't have phone, state, push_token, is_verified_agent
  return {
    id: data.id,
    email: user.email ?? null,
    name: data.display_name ?? null,
    phone: null, // Not in profiles table
    role: data.role ?? 'buyer',
    state: null, // Not in profiles table
    is_verified_agent: false, // Not in profiles table
    verification_level: data.verification_level ?? 0,
    push_token: null, // Not in profiles table
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  // Use profiles table (new schema)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  // Get auth user email if available (only if it's the current user)
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.id === userId ? user.email ?? null : null;
  
  // Map profiles table to User type
  return {
    id: profile.id,
    email: email,
    name: profile.display_name ?? null,
    phone: null, // Not in profiles table
    role: profile.role ?? 'buyer',
    state: null, // Not in profiles table
    is_verified_agent: false, // Not in profiles table
    verification_level: profile.verification_level ?? 0,
    push_token: null, // Not in profiles table
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  } as User;
}

/**
 * Create or update user profile
 * Called after auth signup/login
 */
export async function upsertUser(input: CreateUserInput): Promise<User> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Use profiles table (new schema)
  // Note: profiles table only has: id, role, display_name, verification_level, created_at, updated_at
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        role: input.role ?? 'buyer',
        display_name: input.name ?? null,
        verification_level: 0, // Default
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    // Provide more helpful error messages
    if (error.code === '42501') {
      throw new Error('Permission denied: Missing INSERT policy on profiles table. Please check RLS policies.');
    }
    if (error.code === 'PGRST116') {
      throw new Error('User profile not found after upsert. This may indicate an RLS policy issue.');
    }
    throw error;
  }
  
  if (!data) {
    throw new Error('Failed to create/update user profile: No data returned');
  }
  
  // Map profiles table to User type
  // Note: profiles table doesn't have phone, state, push_token, is_verified_agent
  return {
    id: data.id,
    email: user.email ?? null,
    name: data.display_name ?? null,
    phone: null, // Not in profiles table
    role: data.role ?? 'buyer',
    state: null, // Not in profiles table
    is_verified_agent: false, // Not in profiles table
    verification_level: data.verification_level ?? 0,
    push_token: null, // Not in profiles table
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

/**
 * Update user profile
 */
export async function updateUser(input: UpdateUserInput): Promise<User> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Use profiles table (new schema)
  // Note: profiles table only has: id, role, display_name, verification_level, created_at, updated_at
  const updateData: any = {};
  if (input.role) updateData.role = input.role;
  if (input.name) updateData.display_name = input.name;
  // phone, state, is_verified_agent not in profiles table - skip them

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    // Provide more helpful error messages
    if (error.code === '42501') {
      throw new Error('Permission denied: Cannot update user profile. Check RLS policies.');
    }
    if (error.code === 'PGRST116') {
      // User doesn't exist yet, try to create it
      return await upsertUser({
        role: input.role,
        name: input.name,
        phone: input.phone,
        state: input.state,
        is_verified_agent: input.is_verified_agent,
      });
    }
    throw error;
  }
  
  if (!data) {
    throw new Error('Failed to update user profile: No data returned');
  }
  
  // Map profiles table to User type
  // Note: profiles table doesn't have phone, state, push_token, is_verified_agent
  return {
    id: data.id,
    email: user.email ?? null,
    name: data.display_name ?? null,
    phone: null, // Not in profiles table
    role: data.role ?? 'buyer',
    state: null, // Not in profiles table
    is_verified_agent: false, // Not in profiles table
    verification_level: data.verification_level ?? 0,
    push_token: null, // Not in profiles table
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as User;
}

/**
 * Get user's basic info (for contact purposes)
 */
export async function getUserBasicInfo(userId: string): Promise<Pick<User, 'id' | 'name' | 'email' | 'phone'> | null> {
  // Use profiles table (new schema)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  // Get auth user email if available
  const { data: { user } } = await supabase.auth.getUser();
  
  return {
    id: profile.id,
    name: profile.display_name ?? null,
    email: user?.email ?? null,
    phone: null, // Not in profiles table
  };
}

