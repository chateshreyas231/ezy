// app/context/AuthContext.tsx
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { upsertUser } from '../../services/userService';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function ensureUserRow(user: User | null) {
  try {
    if (!user) return;
    await upsertUser({
      email: user.email ?? undefined,
      role: 'buyer',
    });
  } catch (error) {
    // ignore background upsert errors
    console.warn('Failed to ensure user row:', error);
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: { subscription: { unsubscribe: () => void } } | null = null;
    let hasNetworkError = false;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          // Check if it's a network error
          if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
            hasNetworkError = true;
          }
          setSession(null);
          setUser(null);
        } else {
          setSession(data.session ?? null);
          setUser(data.session?.user ?? null);
        }
      } catch (error: any) {
        // Network errors mean we can't connect to Supabase
        if (error?.message?.includes('Network request failed') || error?.message?.includes('Failed to fetch')) {
          hasNetworkError = true;
        }
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
          
          // Only set up auth state listener if we didn't have a network error
          if (!hasNetworkError) {
            try {
              const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
                if (!mounted) return;
                setSession(next ?? null);
                setUser(next?.user ?? null);
                ensureUserRow(next?.user ?? null);
              });
              subscription = sub;
            } catch (error: any) {
              // Silently fail if we can't set up the listener
            }
          }
        }
      }
    })();

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.warn('Failed to sign out:', error.message || 'Network request failed');
      // Still clear local state even if network request fails
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
