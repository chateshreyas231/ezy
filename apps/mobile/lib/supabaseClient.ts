import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Try to get from expo config first, then fall back to process.env
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_KEY;

// Debug logging (remove in production)
if (__DEV__) {
  console.log('Supabase Config Check:');
  console.log('  From Constants:', {
    url: !!Constants.expoConfig?.extra?.supabaseUrl,
    key: !!Constants.expoConfig?.extra?.supabaseAnonKey,
  });
  console.log('  From process.env:', {
    url: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    key: !!process.env.EXPO_PUBLIC_SUPABASE_KEY,
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('  supabaseUrl:', supabaseUrl ? '✓' : '✗');
  console.error('  supabaseAnonKey:', supabaseAnonKey ? '✓' : '✗');
  throw new Error('Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env file');
}

const CustomStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: CustomStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

