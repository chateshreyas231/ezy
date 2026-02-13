"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!url || !anonKey) {
    if (!url) console.error("Missing Supabase URL. Please set EXPO_PUBLIC_SUPABASE_URL.");
    if (!anonKey) console.error("Missing Supabase Anon Key. Please set EXPO_PUBLIC_SUPABASE_KEY.");
    return null;
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}
