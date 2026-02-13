"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

function parseWaitlistCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export async function getWaitlistCount() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return 0;

  const { data, error } = await supabase.rpc("get_waitlist_count");
  if (error) return 0;
  return parseWaitlistCount(data);
}

export async function isEmailOnWaitlist(email: string) {
  const supabase = getSupabaseBrowserClient();
  const normalized = normalizeEmail(email);
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("is_waitlist_email", {
    email_input: normalized,
  });
  if (error) return false;
  return Boolean(data);
}

export async function addEmailToWaitlist(email: string) {
  const supabase = getSupabaseBrowserClient();
  const normalized = normalizeEmail(email);
  if (!supabase) {
    return {
      ok: false,
      message:
        "Waitlist is temporarily unavailable. Missing Supabase client configuration.",
    };
  }

  const { error } = await supabase.from("waitlist").insert({
    email: normalized,
    source: "web",
  });

  if (!error) return { ok: true };
  if (error.code === "23505") return { ok: true };

  return { ok: false, message: error.message || "Unable to join waitlist right now." };
}
