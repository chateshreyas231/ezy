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
      status: "Strong",
      analysis: "Fast close timeline with high certainty and minimal legal delays.",
    },
    {
      id: 2,
      amount: listing.price + 100000,
      type: "Mortgage",
      contingencies: "Inspection",
      status: "Highest",
      analysis: "Highest offer value, but financing conditions can increase closing time.",
    },
    {
      id: 3,
      amount: Math.max(100000, listing.price - 180000),
      type: "Cash",
      contingencies: "None",
      status: "Low",
      analysis: "Lower price anchor. Consider countering with tighter timeline terms.",
    },
  ];

  const contentHeading = `${listing.title} Offer Intelligence`;

  return (
    <div className="min-h-screen bg-black">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={listing.images[0]}
        bgImageSrc={listing.images[1] ?? listing.images[0]}
        title={listing.title}
        date={listing.location}
        scrollToExpand="Scroll to reveal listing intelligence"
        textBlend
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/explore/agent">
                <ChevronLeft />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{contentHeading}</h1>
              <p className="text-slate-300">
                {listing.title} • {listing.location} • {formatPrice(listing.price)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-white/20 bg-black/30 text-white">
              <CardHeader>
                <CardTitle>Offer Analysis</CardTitle>
                <CardDescription className="text-slate-300">AI-ranked offers based on speed, certainty, and value.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {offers.map((offer, idx) => (
                  <div key={offer.id} className={`p-4 rounded-xl border ${idx === 1 ? "border-cyan-300 bg-cyan-100/10" : "border-white/20 bg-black/30"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">
                          {formatPrice(offer.amount)}{" "}
                          <span className="text-sm font-normal text-slate-300">({offer.type})</span>
                        </h4>
                        <p className="text-sm text-slate-300">
                          {offer.contingencies === "None" ? "No contingencies" : `Contingency: ${offer.contingencies}`}
                        </p>
                      </div>
                      <div className="text-right">
                        {idx === 1 && <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full font-bold">Recommended</span>}
                        {idx === 0 && <span className="bg-sky-500/20 text-sky-300 text-xs px-2 py-1 rounded-full font-bold">Fastest close</span>}
                      </div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg text-sm flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-cyan-300" />
                      <p>
                        <span className="font-semibold">Insight:</span> {offer.analysis}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Accept</Button>
                      <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10">Counter</Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">Decline</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-white/20 bg-black/30 text-white">
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

              <Card className="border-white/20 bg-black/30 text-white">
                <CardHeader>
                  <CardTitle>Suggested Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-white/30 text-white hover:bg-white/10">
                    <TrendingUp className="w-4 h-4 mr-2" /> Promote Listing Campaign
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/30 text-white hover:bg-white/10">
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

