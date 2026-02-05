// services/supabaseClient.ts
// Consolidated Supabase client - Postgres-first, Supabase-second
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables!');
  console.error('Please create a .env file with:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key');
  throw new Error('Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env file');
}

console.log('Initializing Supabase client...');
console.log('URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'MISSING');
console.log('Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING');

// Test connection silently (non-blocking, don't log errors)
(async () => {
  try {
    const testUrl = `${SUPABASE_URL}/rest/v1/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (response.ok || response.status === 404) {
      console.log('✅ Supabase connection successful');
    }
  } catch (error: any) {
    // Silently fail - Supabase may be paused or unavailable
    // This is expected and the app will work in offline mode
    if (!error.message?.includes('aborted')) {
      // Only log if it's not a timeout (timeouts are expected)
    }
  }
})();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'ezriya-platform',
    },
  },
});

console.log('Supabase client initialized');
