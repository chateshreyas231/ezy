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

    // Set a timeout to prevent infinite loading - always set loading to false after 3 seconds max
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('[Auth] Loading timeout - proceeding without session');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    (async () => {
      try {
        console.log('[Auth] Checking session...');
        
        // Use Promise.race to timeout the session check
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) => 
          setTimeout(() => resolve({ data: { session: null }, error: null }), 2000)
        );

        const result = await Promise.race([
          sessionPromise,
          timeoutPromise,
        ]);
        
        if (!mounted) {
          clearTimeout(loadingTimeout);
          return;
        }

        const { data, error } = result as any;

        if (error) {
          console.warn('[Auth] Session error:', error.message);
          setSession(null);
          setUser(null);
        } else if (data) {
          console.log('[Auth] Session check complete, user:', data?.session?.user?.email || 'none');
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
          
          if (data?.session?.user) {
            // Try to ensure user row, but don't block on it
            ensureUserRow(data.session.user).catch(() => {
              // Ignore errors
            });
          }
        } else {
          // Timeout case - no session
          console.log('[Auth] Session check timed out - proceeding without session');
          setSession(null);
          setUser(null);
        }

        // Always set loading to false
        setLoading(false);
        clearTimeout(loadingTimeout);

        // Set up auth state listener (non-blocking)
        try {
          const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
            if (!mounted) return;
            console.log('[Auth] State changed:', next?.user?.email || 'none');
            setSession(next ?? null);
            setUser(next?.user ?? null);
            if (next?.user) {
              ensureUserRow(next.user).catch(() => {
                // Ignore errors
              });
            }
          });
          subscription = sub;
        } catch (error: any) {
          console.warn('[Auth] Failed to set up listener:', error);
        }
      } catch (error: any) {
        // Silently handle timeouts and network errors - they're expected
        if (!error?.message?.includes('timeout') && !error?.message?.includes('Network')) {
          console.warn('[Auth] Unexpected error:', error.message || error);
        }
        if (mounted) {
          // On any error, assume no session and proceed
          setSession(null);
          setUser(null);
          setLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
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
