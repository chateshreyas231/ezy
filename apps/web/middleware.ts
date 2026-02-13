import { NextRequest, NextResponse } from "next/server";

const WAITLIST_EMAIL_COOKIE = "ezriya_waitlist_email";
const WAITLIST_ACCESS_COOKIE = "ezriya_waitlist_access_granted";
const WAITLIST_VERIFIED_AT_COOKIE = "ezriya_waitlist_verified_at";
const WAITLIST_VERIFY_TTL_SECONDS = 60 * 60; // 1 hour
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirectToHome(request: NextRequest, reason: "waitlist" | "auth" = "waitlist") {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  if (reason === "auth") {
    url.searchParams.set("auth", "required");
  } else {
    url.searchParams.set("waitlist", "required");
  }

  const response = NextResponse.redirect(url);
  response.cookies.delete(WAITLIST_EMAIL_COOKIE);
  response.cookies.delete(WAITLIST_ACCESS_COOKIE);
  response.cookies.delete(WAITLIST_VERIFIED_AT_COOKIE);
  return response;
}

async function isWaitlistEmail(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return false;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/is_waitlist_email`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_input: email }),
    });

    if (!response.ok) return false;

    const result = (await response.json()) as boolean;
    return Boolean(result);
  } catch {
    return false;
  }
}

function hasRecentWaitlistVerification(request: NextRequest) {
  const verifiedAtRaw = request.cookies.get(WAITLIST_VERIFIED_AT_COOKIE)?.value;
  if (!verifiedAtRaw) return false;
  const verifiedAt = Number(verifiedAtRaw);
  if (!Number.isFinite(verifiedAt)) return false;
  return Math.floor(Date.now() / 1000) - verifiedAt <= WAITLIST_VERIFY_TTL_SECONDS;
}

function hasAuthSessionCookie(request: NextRequest) {
  const cookies = request.cookies.getAll();
  return cookies.some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthProtectedPath = path.startsWith("/dashboard") || path.startsWith("/app");
  if (isAuthProtectedPath && !hasAuthSessionCookie(request)) {
    return redirectToHome(request, "auth");
  }

  const hasAccessCookie = request.cookies.get(WAITLIST_ACCESS_COOKIE)?.value === "true";
  const email = decodeURIComponent(
    request.cookies.get(WAITLIST_EMAIL_COOKIE)?.value?.trim().toLowerCase() ?? "",
  );

  if (!hasAccessCookie || !email) return redirectToHome(request);
  if (!EMAIL_PATTERN.test(email)) return redirectToHome(request);

  if (hasRecentWaitlistVerification(request)) {
    return NextResponse.next();
  }

  const allowed = await isWaitlistEmail(email);
  if (!allowed) return redirectToHome(request, "waitlist");

  const response = NextResponse.next();
  response.cookies.set(WAITLIST_VERIFIED_AT_COOKIE, String(Math.floor(Date.now() / 1000)), {
    path: "/",
    maxAge: WAITLIST_VERIFY_TTL_SECONDS,
    sameSite: "lax",
    secure: true,
  });
  return response;
}

export const config = {
  matcher: ["/explore/:path*", "/dashboard/:path*", "/app/:path*"],
};
