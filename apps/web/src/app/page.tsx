"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";
import { BlurFade } from "@/components/ui/blur-fade";
import { CountAnimation } from "@/components/ui/count-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { saveWaitlistAccess } from "@/lib/waitlist-access";
import {
  addEmailToWaitlist,
  getWaitlistCount,
  isValidEmail,
} from "@/lib/waitlist-service";
import {
  ArrowRight,
  Building2,
  Sparkles,
  Check,
  Mail,
  MapPin,
} from "lucide-react";

const Testimonial1 = dynamic(() => import("@/components/ui/testimonial-1"));
const OrbitingSkills = dynamic(() => import("@/components/ui/orbiting-skills"));
const ThreeDPhotoCarousel = dynamic(
  () =>
    import("@/components/ui/3d-carousel").then((module) => ({
      default: module.ThreeDPhotoCarousel,
    })),
);

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [waitlistCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [waitlistError, setWaitlistError] = useState("");

  useEffect(() => {
    let mounted = true;
    getWaitlistCount().then((count) => {
      if (mounted) setLiveCount(count);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setWaitlistError("Enter a valid email address.");
      return;
    }

    const result = await addEmailToWaitlist(email);
    if (!result.ok) {
      setWaitlistError(result.message || "Unable to join waitlist right now.");
      return;
    }

    setWaitlistError("");
    setSubmitted(true);
    saveWaitlistAccess(email);
    const count = await getWaitlistCount();
    setLiveCount(count);
  };

  return (
    <DottedSurface className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Radial Gradient Overlay */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-[-20%] left-1/2 w-[80%] h-[60%] -translate-x-1/2 rounded-full",
          "bg-[radial-gradient(ellipse_at_center,theme(colors.primary.DEFAULT/.10),transparent_70%)]",
          "blur-[120px]"
        )}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-[28%] -left-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-[52%] -right-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"
        animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="z-10 container relative mx-auto px-6 py-24 flex flex-col items-center gap-16">

        {/* Hero Section */}
        <div className="min-h-[70vh] w-full flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto pt-8">
          <BlurFade delay={0.05} inView>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-4 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Early Access
            </div>
          </BlurFade>

          <BlurFade delay={0.12} inView>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground">
              Built for Modern Real Estate <br />
              <span className="bg-[length:200%_200%] bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 animate-[gradient-x_4s_ease_infinite]">
                Powered by Ezriya AI
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.18} inView>
            <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
              Manage your buying and selling workflows, data, and collaboration in one place.
            </p>
          </BlurFade>

          <BlurFade delay={0.24} inView className="w-full">
            <div className="flex flex-col items-center justify-center gap-4 pt-4">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <CountAnimation number={liveCount || waitlistCount} className="text-lg font-semibold tabular-nums text-primary" />
                <span className="text-muted-foreground">number already joined</span>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-primary/20 focus-visible:ring-primary/30 h-11 backdrop-blur-sm"
                      required
                    />
                    <Button type="submit" className="h-11 px-8 rounded-md font-medium group text-primary-foreground">
                      Join Waitlist
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 text-primary bg-primary/10 px-6 py-2 rounded-full border border-primary/20 animate-in fade-in zoom-in">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">You&apos;re on the list!</span>
                  </div>
                )}
              </div>
              {waitlistError ? <p className="text-xs text-red-400">{waitlistError}</p> : null}
            </div>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <div className="text-center pt-8">
              <p className="text-sm text-muted-foreground mb-3">Explore the platform experience.</p>
              <Button variant="ghost" className="rounded-full px-6 hover:bg-primary/5 hover:text-primary" asChild>
                <Link href="/explore" className="flex items-center gap-2">
                  View Platform <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </BlurFade>
        </div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Testimonial1 />
        </motion.div>

        <motion.section
          className="w-full max-w-6xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <BlurFade inView delay={0.1}>
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured Properties</p>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">Explore Live Listing Visuals</h2>
            </div>
          </BlurFade>
          <BlurFade inView delay={0.18}>
            <ThreeDPhotoCarousel />
          </BlurFade>
        </motion.section>

        <motion.section
          className="w-full max-w-6xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
        >
          <BlurFade inView delay={0.1}>
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ezriya Network</p>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">Agents, Brokers, Listings, Buyers, Sellers, Vendors</h2>
            </div>
          </BlurFade>
          <BlurFade inView delay={0.18}>
            <OrbitingSkills />
          </BlurFade>
        </motion.section>

        <motion.footer
          className="w-full max-w-6xl mx-auto mt-8 rounded-2xl border border-white/10 bg-background/70 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="grid gap-8 px-6 py-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-primary">
                <Building2 className="h-3.5 w-3.5" />
                Ezriya
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered real estate infrastructure for clients, agents, brokers, and vendor networks.
              </p>
              <p className="text-xs text-muted-foreground/80">
                Professional-grade workflows, transparent collaboration, and structured deal execution.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wide">Product</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="block hover:text-foreground transition-colors">Client Workspace</Link>
                <Link href="/explore/agent" className="block hover:text-foreground transition-colors">Agent Directory</Link>
                <Link href="/explore/broker" className="block hover:text-foreground transition-colors">Brokerage Hub</Link>
                <Link href="/explore/vendor" className="block hover:text-foreground transition-colors">Vendor Marketplace</Link>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wide">Company</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="block hover:text-foreground transition-colors">About</Link>
                <Link href="/careers" className="block hover:text-foreground transition-colors">Careers</Link>
                <Link href="/press-kit" className="block hover:text-foreground transition-colors">Press Kit</Link>
                <Link href="/partner-program" className="block hover:text-foreground transition-colors">Partner Program</Link>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wide">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/contact" className="block hover:text-foreground transition-colors">
                  Contact Page
                </Link>
                <a href="mailto:connect@ezriya.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4" /> connect@ezriya.com
                </a>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Chicago, IL
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-6 py-4 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-xs text-muted-foreground/80">
                © {new Date().getFullYear()} Ezriya, Inc. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
                <Link href="/compliance" className="hover:text-foreground transition-colors">Compliance</Link>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/50 leading-tight max-w-4xl">
              Ezriya is a technology platform and does not provide real estate brokerage services. We do not represent buyers or sellers. All real estate transactions are performed by licensed agents and brokers in our network.
            </p>
          </div>
        </motion.footer>
      </div>
    </DottedSurface>
  );
}
