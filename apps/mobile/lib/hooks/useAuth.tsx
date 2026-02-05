import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Profile } from '@shared/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize loadProfile to avoid recreating it on every render
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If profile doesn't exist, create it using UPSERT
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        // Get user email for display name
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        // If no user is authenticated, don't try to create profile
        if (!authUser || authUser.id !== userId) {
          console.warn('No authenticated user or user ID mismatch, skipping profile creation');
          setLoading(false);
          return;
        }

        const displayName = authUser.email?.split('@')[0] || 'User';

        // Use UPSERT to handle race conditions and ensure profile is created/updated
        const { data: newProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              role: 'buyer',
              display_name: displayName,
              verification_level: 0,
            },
            {
              onConflict: 'id',
            }
          )
          .select()
          .single();

        if (upsertError) {
          console.error('Failed to create profile:', upsertError);
          // Don't throw if it's a permission error - user might not be authenticated yet
          if (upsertError.code === '42501') {
            console.warn('Permission denied creating profile - user may not be authenticated');
            setLoading(false);
            return;
          }
          // Handle foreign key constraint violation
          if (upsertError.code === '23503') {
            console.warn('User not found in auth.users - user may have been deleted');
            setLoading(false);
            return;
          }
          throw upsertError;
        }

        if (newProfile) {
          setProfile(newProfile);
        }
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session - this should restore from AsyncStorage
    // This is the source of truth for the initial session state
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Set the session from storage
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // User is authenticated, load their profile
        loadProfile(session.user.id);
      } else {
        // No session found, user is not authenticated
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes (sign in, sign out, token refresh, etc.)
    // Note: onAuthStateChange fires INITIAL_SESSION first, then other events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Handle INITIAL_SESSION - this fires when the auth state is initialized
      // It should have the same session as getSession(), so we can use it to confirm
      if (event === 'INITIAL_SESSION') {
        // Don't clear state on INITIAL_SESSION - just ensure it matches
        if (session) {
          setSession(session);
          setUser(session.user ?? null);
          if (session.user) {
            loadProfile(session.user.id);
          }
        }
        return;
      }

      // For other events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
      console.log('[Auth] State changed:', event, session?.user?.email || 'none');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        // Only clear profile on explicit sign out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signIn, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
