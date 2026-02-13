"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addEmailToWaitlist,
  isEmailOnWaitlist,
  isValidEmail,
} from "@/lib/waitlist-service";
import {
  getWaitlistEmail,
  hasWaitlistAccess,
  saveWaitlistAccess,
} from "@/lib/waitlist-access";

type GateMode = "choice" | "confirm" | "join";

export function WaitlistGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isClient = typeof window !== "undefined";
  const knownEmail = isClient ? getWaitlistEmail() : "";
  const [hasAccess, setHasAccess] = useState(isClient ? hasWaitlistAccess() : false);
  const [mode, setMode] = useState<GateMode>(knownEmail ? "confirm" : "choice");
  const [email, setEmail] = useState(knownEmail);
  const [error, setError] = useState("");

  const isProtectedRoute = useMemo(() => {
    const publicPaths = [
      "/",
      "/about",
      "/careers",
      "/press-kit",
      "/partner-program",
      "/contact",
      "/privacy-policy",
      "/terms-of-service",
      "/security",
      "/compliance",
    ];
    return !publicPaths.includes(pathname);
  }, [pathname]);

  // If the user has access and there's a redirect param, send them there
  // This handles the case where middleware redirects to /?redirect=... but
  // the client already has access in localStorage
  useEffect(() => {
    if (hasAccess) {
      const redirect = searchParams.get("redirect");
      if (redirect && redirect.startsWith("/")) {
        router.replace(redirect);
      }
    }
  }, [hasAccess, searchParams, router]);

  const showForceModal = searchParams.get("waitlist") === "required";

  const grantAccess = () => {
    saveWaitlistAccess(email);
    setHasAccess(true);
    const redirect = searchParams.get("redirect");
    if (redirect && redirect.startsWith("/")) {
      router.replace(redirect);
      return;
    }
    if (pathname === "/") {
      router.replace("/explore");
    }
  };

  const onConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    const exists = await isEmailOnWaitlist(email);
    if (!exists) {
      setError("This email is not on the waitlist. Please join first.");
      return;
    }

    grantAccess();
  };

  const onJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    const result = await addEmailToWaitlist(email);
    if (!result.ok) {
      setError(result.message || "Unable to join waitlist right now.");
      return;
    }

    grantAccess();
  };

  if (!isClient) return <>{children}</>;
  // If user has access, let them through
  if (hasAccess) return <>{children}</>;
  // If not protected AND not forced, let them through
  if (!isProtectedRoute && !showForceModal) return <>{children}</>;

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm p-4 grid place-items-center">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-background/95 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ezriya Access</p>
          <h3 className="text-xl font-semibold mt-2">Waitlist Confirmation Required</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Access to platform pages is unlocked after waitlist signup.
          </p>

          {mode === "choice" ? (
            <div className="mt-6 grid gap-3">
              <Button variant="outline" onClick={() => setMode("confirm")}>
                I am already on the waitlist
              </Button>
              <Button onClick={() => setMode("join")}>I am new, join waitlist</Button>
            </div>
          ) : (
            <form onSubmit={mode === "confirm" ? onConfirm : onJoin} className="mt-6 space-y-3">
              <label className="text-sm text-muted-foreground">
                {mode === "confirm" ? "Confirm your waitlist email" : "Enter your email to join and continue"}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="you@company.com"
                required
              />
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setMode("choice")}>
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
