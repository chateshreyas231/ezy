// services/supabaseClient.ts
// Consolidated Supabase client - Postgres-first, Supabase-second
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// Custom fetch that suppresses network errors
const customFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    return await fetch(input, init);
  } catch (error: any) {
    // Suppress network errors to prevent console spam
    if (error?.message?.includes('Network request failed') || error?.message?.includes('Failed to fetch')) {
      // Return a rejected promise with a controlled error instead of throwing
      return Promise.reject(new Error('Network request failed'));
    }
    throw error;
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false, // Disable auto-refresh to prevent repeated network calls
    persistSession: false, // Disable session persistence to prevent connection attempts
    detectSessionInUrl: false,
  },
  global: {
    fetch: customFetch,
  },
});

