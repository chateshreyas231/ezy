"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_WAITLIST_KEY = "ezriya_waitlist_local";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readLocalWaitlist() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_KEY);
    if (!raw) return [] as string[];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as string[];
  }
}

function writeLocalWaitlist(emails: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_WAITLIST_KEY, JSON.stringify(emails));
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export async function getWaitlistCount() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return readLocalWaitlist().length;

  const { data, error } = await supabase.rpc("get_waitlist_count");
  if (error || typeof data !== "number") return readLocalWaitlist().length;
  return data;
}

export async function isEmailOnWaitlist(email: string) {
  const supabase = getSupabaseBrowserClient();
  const normalized = normalizeEmail(email);
  if (!supabase) return readLocalWaitlist().includes(normalized);

  const { data, error } = await supabase.rpc("is_waitlist_email", {
    email_input: normalized,
  });
  if (error) return readLocalWaitlist().includes(normalized);
  return Boolean(data);
}

export async function addEmailToWaitlist(email: string) {
  const supabase = getSupabaseBrowserClient();
  const normalized = normalizeEmail(email);
  if (!supabase) {
    const local = readLocalWaitlist();
    if (!local.includes(normalized)) {
      writeLocalWaitlist([...local, normalized]);
    }
    return { ok: true };
  }

  const { error } = await supabase.from("waitlist").insert({
    email: normalized,
    source: "web",
  });

  if (!error) return { ok: true };
  if (error.code === "23505") return { ok: true };

  return { ok: false, message: error.message || "Unable to join waitlist right now." };
}
