"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { AlertCircle, Check, ChevronLeft, TrendingUp } from "lucide-react";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ListingManagePage() {
  const params = useParams<{ id: string }>();
  const listing = useMemo(
    () => MOCK_LISTINGS.find((item) => item.id === params.id) ?? MOCK_LISTINGS[0],
    [params.id],
  );

  const offers = [
    {
      id: 1,
      amount: Math.max(100000, listing.price - 50000),
      type: "Cash",
      contingencies: "None",
      status: "For review",
      analysis: "Shorter timeline and fewer conditions based on participant-submitted terms.",
    },
    {
      id: 2,
      amount: listing.price + 100000,
      type: "Mortgage",
      contingencies: "Inspection",
      status: "For review",
      analysis: "Higher amount with financing conditions that may affect timing.",
    },
    {
      id: 3,
      amount: Math.max(100000, listing.price - 180000),
      type: "Cash",
      contingencies: "None",
      status: "For review",
      analysis: "Lower price anchor with fewer conditions for user review.",
    },
  ];

  const contentHeading = `${listing.title} Offer Information`;

  return (
    <div className="min-h-screen bg-background">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={listing.images[0]}
        bgImageSrc={listing.images[1] ?? listing.images[0]}
        title={listing.title}
        date={listing.location}
        scrollToExpand="Scroll to reveal listing information"
        textBlend
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-foreground hover:bg-accent hover:text-foreground">
              <Link href="/explore/agent">
                <ChevronLeft />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{contentHeading}</h1>
              <p className="text-muted-foreground">
                {listing.title} • {listing.location} • {formatPrice(listing.price)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Offer information is provided for user review. Ezriya does not provide pricing, negotiation, or transaction advice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border bg-card text-foreground">
              <CardHeader>
                <CardTitle>Offer Comparison Signals</CardTitle>
                <CardDescription className="text-muted-foreground">Participant metrics and terms shown for review only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {offers.map((offer, idx) => (
                  <div key={offer.id} className={`p-4 rounded-xl border ${idx === 1 ? "border-cyan-300 bg-cyan-100/10" : "border-border bg-card/50"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">
                          {formatPrice(offer.amount)}{" "}
                          <span className="text-sm font-normal text-muted-foreground">({offer.type})</span>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {offer.contingencies === "None" ? "No contingencies" : `Contingency: ${offer.contingencies}`}
                        </p>
                      </div>
                      <div className="text-right">
                        {idx === 1 && <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full font-bold">Higher amount</span>}
                        {idx === 0 && <span className="bg-sky-500/20 text-sky-300 text-xs px-2 py-1 rounded-full font-bold">Shorter timeline</span>}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg text-sm flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-cyan-300" />
                      <p>
                        <span className="font-semibold">Information to review:</span> {offer.analysis}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Accept</Button>
                      <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-accent">Counter</Button>
                      <Button size="sm" variant="ghost" className="text-foreground hover:bg-accent">Decline</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border bg-card text-foreground">
                <CardHeader>
                  <CardTitle>Listing Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <span className="font-bold">{listing.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Open Offers</span>
                    <span className="font-bold">{listing.offers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Property Specs</span>
                    <span className="font-bold">
                      {listing.specs.beds}bd / {listing.specs.baths}ba
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Area</span>
                    <span className="font-bold">{listing.specs.sqft.toLocaleString()} sqft</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card text-foreground">
                <CardHeader>
                  <CardTitle>User Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-border/50 text-foreground hover:bg-accent">
                    <TrendingUp className="w-4 h-4 mr-2" /> Promote Listing Campaign
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border/50 text-foreground hover:bg-accent">
                    <Check className="w-4 h-4 mr-2" /> Schedule Open House
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
