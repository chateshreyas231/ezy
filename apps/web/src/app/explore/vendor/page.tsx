"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { DottedSurface } from "@/components/ui/dotted-surface";
import PromptInputDynamicGrow from "@/components/ui/prompt-input-dynamic-grow";
import { MOCK_VENDORS } from "@/lib/mock-data";
import { Star, Wrench } from "lucide-react";

export default function VendorPage() {
  const [query, setQuery] = useState("");

  const filteredVendors = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return MOCK_VENDORS.filter((vendor) => {
      const haystack = [
        vendor.name,
        vendor.company,
        vendor.category,
        vendor.specialties.join(" "),
        vendor.serviceAreas.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return normalized.length === 0 || haystack.includes(normalized);
    }).sort((a, b) => b.rating - a.rating || b.completedProjects - a.completedProjects);
  }, [query]);

  return (
    <DottedSurface className="min-h-screen pt-24 pb-14 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="max-w-5xl mx-auto text-center space-y-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background p-6 md:p-10">
          <Badge variant="secondary" className="mx-auto bg-primary/10 border-primary/25">
            Vendor Marketplace
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Find the Right Vendor, Fast</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Discover verified vendors across inspections, staging, photography, lending, legal, and renovations.
            Use AI search to match by specialty, location, and service speed.
          </p>
          <div className="pt-2">
            <PromptInputDynamicGrow
              placeholder="Try: luxury staging in Miami, fast inspection in LA, or top-rated legal vendors"
              onSubmit={(value) => setQuery(value)}
            />
          </div>
        </section>

        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-semibold">Vendors</h2>
          <p className="text-sm text-muted-foreground">{filteredVendors.length} results</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredVendors.map((vendor) => (
            <Link key={vendor.id} href={`/explore/vendor/${vendor.id}`}>
              <Card className="h-full overflow-hidden border-primary/20 hover:border-primary/50 hover:shadow-[0_14px_34px_rgba(59,130,246,0.18)] transition-all">
                <div className="relative h-24">
                  <img src={vendor.banner} alt={vendor.company} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute left-2.5 bottom-2.5 flex items-center gap-1.5 text-white text-[10px]">
                    <Wrench className="h-3 w-3" />
                    {vendor.category}
                  </div>
                </div>
                <CardHeader className="space-y-1 pb-1 px-3 pt-3">
                  <div className="flex items-center gap-2.5">
                    <img src={vendor.avatar} alt={vendor.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20" />
                    <div>
                      <CardTitle className="text-sm leading-tight line-clamp-1">{vendor.company}</CardTitle>
                      <CardDescription className="text-[11px]">{vendor.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 pt-0 px-3 pb-3">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-400" />
                      {vendor.rating.toFixed(1)} ({vendor.reviewCount})
                    </span>
                    <span className="text-muted-foreground">{vendor.responseTimeHours}h response</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="rounded-md border bg-background/60 p-1">
                      <p className="text-[10px] text-muted-foreground">Projects</p>
                      <p className="font-semibold">{vendor.completedProjects}</p>
                    </div>
                    <div className="rounded-md border bg-background/60 p-1">
                      <p className="text-[10px] text-muted-foreground">Experience</p>
                      <p className="font-semibold">{vendor.yearsInBusiness} years</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2">{vendor.bio}</p>

                  <div className="flex flex-wrap gap-1">
                    {vendor.specialties.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="bg-primary/10 border-primary/20 text-[9px] px-1 py-0.5">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <ChatbotFab
        title="Vendor Assistant"
        placeholder="Describe the service you need and location to get the best vendor matches"
      />
    </DottedSurface>
  );
}
