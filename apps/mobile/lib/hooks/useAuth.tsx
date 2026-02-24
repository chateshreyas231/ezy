import type { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import * as authApi from '../api/auth';
import { dbRoleToPortal } from '../role';
import { supabase } from '../supabase';
import type { AppProfile, LoginPortal } from '../types/app';

type AuthContextType = {
  session: Session | null;
  profile: AppProfile | null;
  portal: LoginPortal;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  const portal = useMemo<LoginPortal>(() => {
    const metadataPortal = session?.user?.user_metadata?.app_portal as LoginPortal | undefined;
    if (metadataPortal === 'client' || metadataPortal === 'agent' || metadataPortal === 'broker_vendor') {
      return metadataPortal;
    }
    return dbRoleToPortal(profile?.role);
  }, [profile?.role, session?.user?.user_metadata?.app_portal]);

  const refreshProfile = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    const next = await authApi.getProfile(userId);
    setProfile(next);
  };

  useEffect(() => {
    let isMounted = true;

    authApi
      .getSession()
      .then(async (s) => {
        if (!isMounted) return;
        setSession(s);
        if (s?.user?.id) {
          const p = await authApi.getProfile(s.user.id);
          if (isMounted) setProfile(p);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (!newSession?.user?.id) {
        setProfile(null);
        return;
      }
      const p = await authApi.getProfile(newSession.user.id);
      setProfile(p);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/select-role');
      return;
    }

    if (session && profile && inAuthGroup) {
      if (portal === 'client') {
        router.replace('/(app)/(client)/ai');
      } else if (portal === 'agent') {
        router.replace('/(app)/(agent)/ai');
      } else {
        router.replace('/(app)/(broker-vendor)/ai');
      }
      return;
    }

    if (!inAppGroup && session && profile) {
      if (portal === 'client') {
        router.replace('/(app)/(client)/ai');
      } else if (portal === 'agent') {
        router.replace('/(app)/(agent)/ai');
      } else {
        router.replace('/(app)/(broker-vendor)/ai');
      }
    }
  }, [loading, portal, profile, router, segments, session]);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      profile,
      portal,
      loading,
      refreshProfile,
    }),
    [session, profile, portal, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
