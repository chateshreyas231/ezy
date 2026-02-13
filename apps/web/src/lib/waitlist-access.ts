export const WAITLIST_EMAIL_KEY = "ezriya_waitlist_email";
export const WAITLIST_ACCESS_KEY = "ezriya_waitlist_access_granted";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function saveWaitlistAccess(email: string) {
  if (typeof window === "undefined") return;
  const normalized = normalizeEmail(email);
  localStorage.setItem(WAITLIST_EMAIL_KEY, normalized);
  localStorage.setItem(WAITLIST_ACCESS_KEY, "true");
}

export function getWaitlistEmail() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(WAITLIST_EMAIL_KEY) ?? "";
}

export function hasWaitlistAccess() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(WAITLIST_ACCESS_KEY) === "true";
}

export function emailMatchesStored(email: string) {
  const stored = getWaitlistEmail();
  if (!stored) return true;
  return normalizeEmail(email) === stored;
}
