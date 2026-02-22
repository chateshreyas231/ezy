"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MOCK_BROKERS, MOCK_VENDORS } from "@/lib/mock-data";

type DirectoryMode = "all" | "broker" | "vendor";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<DirectoryMode>("all");

  const items = useMemo(() => {
    const brokerItems = MOCK_BROKERS.map((broker) => ({
      id: broker.id,
      type: "broker" as const,
      title: broker.name,
      subtitle: broker.tagline,
      meta: broker.headquarters,
      image: broker.logo,
      href: `/explore/broker/${broker.id}`,
    }));

    const vendorItems = MOCK_VENDORS.map((vendor) => ({
      id: vendor.id,
      type: "vendor" as const,
      title: vendor.company,
      subtitle: vendor.bio,
      meta: `${vendor.category} • ${vendor.serviceAreas[0]}`,
      image: vendor.avatar,
      href: `/explore/vendor/${vendor.id}`,
    }));

    const combined = mode === "broker" ? brokerItems : mode === "vendor" ? vendorItems : [...brokerItems, ...vendorItems];
    const normalized = query.trim().toLowerCase();

    if (!normalized) return combined;
    return combined.filter((item) => `${item.title} ${item.subtitle} ${item.meta} ${item.type}`.toLowerCase().includes(normalized));
  }, [mode, query]);

  return (
    <div className="relative min-h-screen bg-white px-8 pb-8 pt-28 md:pt-32 dark:bg-background">
      <DotPattern className={cn("[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]")} />

      <header className="relative z-10 mb-12 text-center">
        <BlurFade delay={0.25} inView>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Directory Hub</h2>
        </BlurFade>
        <BlurFade delay={0.5} inView>
          <span className="font-[Outfit] text-[16px] font-normal text-[#737880] sm:text-[20px]">
            Find the right brokers and vendors with AI-assisted search.
          </span>
        </BlurFade>
      </header>

      <div className="relative z-10 mx-auto mb-16 max-w-2xl">
        <AIInputWithSearch
          placeholder="Find brokers in NY, staging vendors in Miami, mortgage experts..."
          onSubmit={(value, withSearch) => {
            setQuery(value);
            if (!withSearch) {
              setMode("all");
            }
          }}
          onFileSelect={() => {}}
        />
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setMode("all")}
            className={cn("rounded-full border px-3 py-1 text-sm", mode === "all" ? "border-primary bg-primary/10 text-primary" : "border-border")}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setMode("broker")}
            className={cn("rounded-full border px-3 py-1 text-sm", mode === "broker" ? "border-primary bg-primary/10 text-primary" : "border-border")}
          >
            Brokers
          </button>
          <button
            type="button"
            onClick={() => setMode("vendor")}
            className={cn("rounded-full border px-3 py-1 text-sm", mode === "vendor" ? "border-primary bg-primary/10 text-primary" : "border-border")}
          >
            Vendors
          </button>
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-semibold">Brokers & Vendors</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="group relative overflow-hidden rounded-xl border border-primary/15 bg-white/80 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/35">
              <div className="h-[220px] w-full overflow-hidden rounded-xl">
                <img src={item.image} alt={item.title} className="h-[220px] w-full rounded-xl object-cover transition-all duration-300 group-hover:scale-105" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 font-semibold">{item.title}</p>
                  <Badge variant="outline" className="capitalize">{item.type}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              </div>
            </Link>
          ))}
        </div>
        {items.length === 0 ? <p className="mt-8 text-center text-sm text-muted-foreground">No results found. Try another query.</p> : null}
      </section>
    </div>
  );
}
