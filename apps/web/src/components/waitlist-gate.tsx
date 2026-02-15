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
import { Loader2 } from "lucide-react";

export function WaitlistGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize state
  const [hasAccess, setHasAccess] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check access on mount
  useEffect(() => {
    // useEffect only runs on client, so we don't need isClient check here
    const access = hasWaitlistAccess();
    setHasAccess(access);
    if (!access) {
      // Pre-fill email if we have it but access is expired/revoked
      const storedEmail = getWaitlistEmail();
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

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
    // If it's the root path, we don't block it unless specific params require it
    // But generally '/' is public.
    return !publicPaths.includes(pathname);
  }, [pathname]);

  // Handle post-access redirect
  useEffect(() => {
    if (hasAccess) {
      const redirect = searchParams.get("redirect");
      if (redirect && redirect.startsWith("/")) {
        router.replace(redirect);
      }
    }
  }, [hasAccess, searchParams, router]);

  const showForceModal = searchParams.get("waitlist") === "required";

  // Failsafe: If user is stuck on "waitlist=required" for > 30s, force a re-check or redirect
  useEffect(() => {
    if (showForceModal) {
      const timer = setTimeout(() => {
        // If we still haven't redirected (component still mounted), check access again
        const access = hasWaitlistAccess();
        if (access) {
          router.replace(searchParams.get("redirect") || "/explore");
        } else {
          // Ensure modal is visible (it should be)
          // We could potentially trigger a toast or shake effect here if needed
        }
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [showForceModal, router, searchParams]);

  const grantAccess = (validEmail: string) => {
    saveWaitlistAccess(validEmail);
    setHasAccess(true);

    // Redirect logic
    const redirect = searchParams.get("redirect");
    if (redirect && redirect.startsWith("/")) {
      router.replace(redirect);
      return;
    }
    // If we are on the home page and just granted access via the modal, send to explore
    if (pathname === "/") {
      router.push("/explore");
    }
  };

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if email exists
      const exists = await isEmailOnWaitlist(email);

      if (exists) {
        // Already on waitlist -> Grant Access
        grantAccess(email);
      } else {
        // Not on waitlist -> Add to waitlist -> Grant Access
        const result = await addEmailToWaitlist(email);
        if (result.ok) {
          grantAccess(email);
        } else {
          setError(result.message || "Something went wrong. Please try again.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Logic
  // We always render children to prevent hydration mismatch with the server (which always renders children).
  // The gate is an overlay that blocks interaction if needed.

  const shouldShowGate = mounted && !hasAccess && (isProtectedRoute || showForceModal);

  return (
    <>
      {children}
      {shouldShowGate && (
        <div className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm p-4 grid place-items-center">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-background/95 p-6 shadow-2xl">
            <div className="text-center space-y-2 mb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ezriya Access</p>
              <h3 className="text-xl font-semibold">Welcome to Ezriya</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email to verify your waitlist status and access the platform.
              </p>
            </div>

            <form onSubmit={handleAccess} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="name@company.com"
                  className="bg-background/50"
                  autoFocus
                  required
                />
                {error ? <p className="text-xs text-red-400 pl-1">{error}</p> : null}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue to Platform"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
