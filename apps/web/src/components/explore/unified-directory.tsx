"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { DottedSurface } from "@/components/ui/dotted-surface";
import PromptInputDynamicGrow from "@/components/ui/prompt-input-dynamic-grow";
import { MOCK_BROKERS, MOCK_VENDORS } from "@/lib/mock-data";
import { Clock3, Filter, Star } from "lucide-react";

type DirectoryMode = "all" | "broker" | "vendor";

type DirectoryItem = {
  id: string;
  kind: "broker" | "vendor";
  href: string;
  image: string;
  badge: string;
  name: string;
  subtitle: string;
  description: string;
  rating: string;
  meta: string;
  tagA: string;
  tagB: string;
};

function formatMoney(value: number): string {
  const abs = Math.abs(value);
  const tiers = [
    { limit: 1_000_000_000, suffix: "B" },
    { limit: 1_000_000, suffix: "M" },
    { limit: 1_000, suffix: "K" },
  ] as const;

  for (const tier of tiers) {
    if (abs >= tier.limit) {
      const compact = (value / tier.limit).toFixed(1).replace(/\.0$/, "");
      return `$${compact}${tier.suffix}`;
    }
  }

  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function UnifiedDirectory() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<DirectoryMode>("all");

  const items = useMemo<DirectoryItem[]>(() => {
    const brokerItems: DirectoryItem[] = MOCK_BROKERS.map((broker) => ({
      id: broker.id,
      kind: "broker",
      href: `/explore/broker/${broker.id}`,
      image: broker.logo,
      badge: "Broker",
      name: broker.name,
      subtitle: `${broker.headquarters} • ${broker.agents.length} agents`,
      description: broker.tagline,
      rating: broker.stats.averageRating.toFixed(1),
      meta: `${formatMoney(broker.stats.totalVolume)} volume`,
      tagA: broker.specializations[0] ?? "Market Strategy",
      tagB: broker.specializations[1] ?? "Growth",
    }));

    const vendorItems: DirectoryItem[] = MOCK_VENDORS.map((vendor) => ({
      id: vendor.id,
      kind: "vendor",
      href: `/explore/vendor/${vendor.id}`,
      image: vendor.banner,
      badge: "Vendor",
      name: vendor.company,
      subtitle: `${vendor.name} • ${vendor.category}`,
      description: vendor.bio,
      rating: vendor.rating.toFixed(1),
      meta: `${vendor.responseTimeHours}h response`,
      tagA: vendor.specialties[0] ?? vendor.category,
      tagB: vendor.specialties[1] ?? "Verified",
    }));

    return [...brokerItems, ...vendorItems];
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return items
      .filter((item) => (mode === "all" ? true : item.kind === mode))
      .filter((item) => {
        const haystack = `${item.name} ${item.subtitle} ${item.description} ${item.tagA} ${item.tagB}`.toLowerCase();
        return normalized.length === 0 || haystack.includes(normalized);
      })
      .sort((a, b) => Number(b.rating) - Number(a.rating));
  }, [items, mode, query]);

  return (
    <DottedSurface className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-white p-6 md:p-10 text-center space-y-4">
          <Badge variant="secondary" className="mx-auto bg-neutral-100 text-neutral-700 border-neutral-200">
            Unified Directory
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Brokers and Vendors in One Place</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-base">
            Search across brokerages and service vendors from one directory. Use the AI bar below to quickly filter who fits your needs.
          </p>

          <div className="pt-2 max-w-3xl mx-auto">
            <PromptInputDynamicGrow
              placeholder="Try: top-rated broker in Miami or fast inspection vendor in LA"
              onSubmit={(value) => setQuery(value)}
            />
          </div>
        </section>

        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardContent className="p-3 flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <Filter className="h-3.5 w-3.5" />
              Type
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={mode === "all" ? "default" : "outline"} size="sm" onClick={() => setMode("all")}>All</Button>
              <Button variant={mode === "broker" ? "default" : "outline"} size="sm" onClick={() => setMode("broker")}>Broker</Button>
              <Button variant={mode === "vendor" ? "default" : "outline"} size="sm" onClick={() => setMode("vendor")}>Vendor</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Link key={`${item.kind}-${item.id}`} href={item.href}>
              <Card className="h-full overflow-hidden border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_14px_30px_rgba(0,0,0,0.1)]">
                <div className="relative h-32">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute left-3 bottom-3 rounded-full bg-black/45 px-2.5 py-1 text-xs text-white">
                    {item.badge}
                  </div>
                </div>

                <CardHeader className="space-y-2 pb-2">
                  <CardTitle className="text-xl leading-tight line-clamp-1">{item.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-1">{item.subtitle}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" /> {item.rating}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" /> {item.meta}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-neutral-100 border-neutral-200 text-neutral-700">{item.tagA}</Badge>
                    <Badge variant="secondary" className="bg-neutral-100 border-neutral-200 text-neutral-700">{item.tagB}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <ChatbotFab
        title="Directory Assistant"
        placeholder="Ask for broker or vendor matches by city, service, and rating"
      />
    </DottedSurface>
  );
}
