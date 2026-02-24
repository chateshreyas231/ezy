import type { Session, User } from '@supabase/supabase-js';

import { allowedRolesForPortal, portalToDbRole } from '../role';
import { supabase } from '../supabase';
import type { AppProfile, LoginPortal } from '../types/app';

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(userId: string): Promise<AppProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, role, display_name, verification_level, buyer_verified, seller_verified, readiness_score, created_at',
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as AppProfile | null) ?? null;
}

async function waitForProfile(userId: string, retries = 20): Promise<AppProfile | null> {
  for (let i = 0; i < retries; i += 1) {
    const profile = await getProfile(userId);
    if (profile) return profile;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return null;
}

export async function signIn(email: string, password: string, portal: LoginPortal) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (!data.user) return data;

  const profile = await waitForProfile(data.user.id);
  if (!profile) {
    throw new Error('Account provisioning is still in progress. Please retry in a few seconds.');
  }

  const allowedRoles = allowedRolesForPortal(portal);
  if (!allowedRoles.includes(profile.role)) {
    throw new Error(`This account is not allowed in ${portal} portal. Please use the correct login.`);
  }

  return data;
}

export async function signUp(params: {
  email: string;
  password: string;
  displayName: string;
  portal: LoginPortal;
}) {
  const dbRole = portalToDbRole(params.portal);

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        app_portal: params.portal,
        role: dbRole,
        display_name: params.displayName,
      },
    },
  });

  if (error) throw error;

  return data;
}

export async function requestSignupOtp(params: {
  email: string;
  displayName: string;
  portal: LoginPortal;
}) {
  const dbRole = portalToDbRole(params.portal);

  const { data, error } = await supabase.auth.signInWithOtp({
    email: params.email,
    options: {
      shouldCreateUser: true,
      data: {
        app_portal: params.portal,
        role: dbRole,
        display_name: params.displayName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'ezriya://reset-password',
  });

  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
