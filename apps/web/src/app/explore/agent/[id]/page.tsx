"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSurface } from "@/components/ui/dotted-surface";
import PortfolioHero from "@/components/ui/portfolio-hero";
import { MOCK_AGENTS, MOCK_LISTINGS } from "@/lib/mock-data";
import { ArrowLeft, Building, Globe, Landmark, MapPin, MessageSquare, Star, TrendingUp, Users } from "lucide-react";

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

type AgentShowcaseProfile = {
  pitch: string;
  coverageAreas: string[];
  propertyMix: {
    buy: number;
    sell: number;
    rent: number;
    commercial: number;
    newDevelopment: number;
  };
  inTalks: {
    buyers: number;
    sellers: number;
    investors: number;
  };
  network: {
    buyers: number;
    sellers: number;
    builders: number;
    lenders: number;
    attorneys: number;
  };
  builderConnections: string[];
  impact: string[];
  reviews: Array<{ name: string; role: string; text: string; rating: number }>;
};

const AGENT_SHOWCASE: Record<string, AgentShowcaseProfile> = {
  "agent-1": {
    pitch:
      "Luxury specialist helping buyers and sellers close high-value deals with precision, private-market access, and clean execution.",
    coverageAreas: ["Beverly Hills", "West Hollywood", "Santa Monica", "Brentwood"],
    propertyMix: { buy: 38, sell: 32, rent: 8, commercial: 7, newDevelopment: 15 },
    inTalks: { buyers: 11, sellers: 7, investors: 4 },
    network: { buyers: 96, sellers: 62, builders: 14, lenders: 18, attorneys: 9 },
    builderConnections: ["Pacific Crest Developments", "LuxeStone Builders", "Blue Vista Projects"],
    impact: [
      "Reduced average negotiation cycle by 21% over the last 12 months.",
      "Consistent top-decile close rate in luxury zip codes.",
      "High repeat-client referrals from cross-border buyers.",
    ],
    reviews: [
      {
        name: "Mia Harper",
        role: "Seller",
        text: "The strategy and pricing guidance were exceptional. We had qualified offers in days.",
        rating: 5,
      },
      {
        name: "Ethan Wells",
        role: "Buyer",
        text: "Excellent communication and strong deal control from offer to closing.",
        rating: 5,
      },
    ],
  },
};

function fallbackShowcase(location: string, rating: number): AgentShowcaseProfile {
  return {
    pitch:
      "Results-driven agent focused on smooth closings, transparent communication, and strong market positioning for buyers and sellers.",
    coverageAreas: [location, "Downtown", "Waterfront", "Suburban Growth Corridor"],
    propertyMix: { buy: 34, sell: 30, rent: 14, commercial: 8, newDevelopment: 14 },
    inTalks: { buyers: 8, sellers: 6, investors: 3 },
    network: { buyers: 72, sellers: 48, builders: 10, lenders: 14, attorneys: 7 },
    builderConnections: ["Urban Core Builders", "Crestline Projects", "Harbor Development Group"],
    impact: [
      "Maintains consistent pipeline visibility across active buyer and seller conversations.",
      `Client satisfaction benchmark maintained above ${rating.toFixed(1)} stars.`,
      "Collaborates with vetted lenders, attorneys, and builders for faster closings.",
    ],
    reviews: [
      {
        name: "Jordan Kim",
        role: "Buyer",
        text: "Very responsive and detailed throughout due diligence and negotiations.",
        rating: 5,
      },
      {
        name: "Avery Collins",
        role: "Seller",
        text: "Clear process, strong buyer screening, and great support from list to close.",
        rating: 4,
      },
    ],
  };
}

const MIX_META: Array<{ key: keyof AgentShowcaseProfile["propertyMix"]; label: string }> = [
  { key: "buy", label: "Buy" },
  { key: "sell", label: "Sell" },
  { key: "rent", label: "Rent" },
  { key: "commercial", label: "Commercial" },
  { key: "newDevelopment", label: "New Development" },
];

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const agent = useMemo(() => MOCK_AGENTS.find((entry) => entry.id === params.id), [params.id]);

  if (!agent) {
    return (
      <DottedSurface className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="outline" asChild>
            <Link href="/explore/agent">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to agents
            </Link>
          </Button>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Agent not found.</CardContent>
          </Card>
        </div>
      </DottedSurface>
    );
  }

  const agentListings = MOCK_LISTINGS.filter((listing) => listing.agentId === agent.id);
  const averageDeal = agent.stats.sold === 0 ? 0 : Math.round(agent.stats.volume / agent.stats.sold);
  const closeRate = Math.min(97, 72 + Math.round(agent.rating * 4) + Math.floor(agent.experienceYears / 2));
  const avgDom = Math.max(11, 28 - Math.floor(agent.experienceYears / 2));
  const showcase = AGENT_SHOWCASE[agent.id] ?? fallbackShowcase(agent.location, agent.rating);
  const [firstName, ...restName] = agent.name.split(" ");
  const lastName = restName.join(" ") || "Agent";
  const detailCardClass =
    "border-primary/25 bg-gradient-to-br from-background via-primary/5 to-background shadow-[0_8px_24px_rgba(59,130,246,0.08)]";
  const tileClass = "rounded-lg border border-primary/20 bg-primary/5 p-3";

  return (
    <DottedSurface id="top" className="min-h-screen pb-14">
      <PortfolioHero
        firstName={firstName}
        lastName={lastName}
        imageUrl={agent.avatar}
        tagline={showcase.pitch}
        scrollTargetId="agent-details"
      />

      <div id="agent-details" className="max-w-7xl mx-auto space-y-8 pt-10 px-4 md:px-8">
        <Button variant="outline" asChild>
          <Link href="/explore/agent">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all agents
          </Link>
        </Button>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Closed Deals" value={`${agent.stats.sold}`} />
          <StatCard label="Active Listings" value={`${agent.stats.active}`} />
          <StatCard label="Total Volume" value={formatMoney(agent.stats.volume)} />
          <StatCard label="Avg Deal" value={formatMoney(averageDeal)} />
          <StatCard label="Close Rate" value={`${closeRate}%`} />
          <StatCard label="Avg DOM" value={`${avgDom} days`} />
        </div>

        <div id="agent-listings" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 ${detailCardClass}`}>
            <CardHeader>
              <CardTitle>Listings and Portfolio</CardTitle>
              <CardDescription>Properties currently represented by {agent.name}.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentListings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active listings available.</p>
              ) : (
                agentListings.map((listing) => (
                  <Link key={listing.id} href={`/explore/agent/listing/${listing.id}`}>
                    <div className="rounded-xl border border-primary/20 bg-background/85 hover:border-primary/40 hover:shadow-[0_10px_24px_rgba(59,130,246,0.12)] transition-all overflow-hidden">
                      <img src={listing.images[0]} alt={listing.title} className="h-40 w-full object-cover" />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold leading-tight">{listing.title}</h3>
                          <Badge variant={listing.status === "Active" ? "default" : "secondary"}>{listing.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                        <p className="text-lg font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(listing.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.specs.beds} beds • {listing.specs.baths} baths • {listing.specs.sqft.toLocaleString()} sqft
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className={detailCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Area Coverage Map</CardTitle>
                <CardDescription>Primary service neighborhoods and micro-markets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-primary/20 p-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
                  <div className="text-xs text-muted-foreground mb-2">Coverage Center</div>
                  <div className="font-semibold">{agent.location}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {showcase.coverageAreas.map((area) => (
                      <Badge key={area} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={detailCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Property Type Mix</CardTitle>
                <CardDescription>Volume distribution across deal categories.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MIX_META.map((mix) => {
                  const value = showcase.propertyMix[mix.key];
                  return (
                    <div key={mix.key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{mix.label}</span>
                        <span className="font-semibold">{value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary/60 to-primary" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className={detailCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> In Talks</CardTitle>
                <CardDescription>Active conversation pipeline across client segments.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-center">
                <PipelineMetric label="Buyers" value={showcase.inTalks.buyers} />
                <PipelineMetric label="Sellers" value={showcase.inTalks.sellers} />
                <PipelineMetric label="Investors" value={showcase.inTalks.investors} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div id="agent-network" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={detailCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Connection Network</CardTitle>
              <CardDescription>Transaction relationships supporting fast execution.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <StatMini label="Buyers" value={showcase.network.buyers} />
              <StatMini label="Sellers" value={showcase.network.sellers} />
              <StatMini label="Builders" value={showcase.network.builders} />
              <StatMini label="Lenders" value={showcase.network.lenders} />
              <StatMini label="Attorneys" value={showcase.network.attorneys} />
              <StatMini label="Active Listings" value={agent.stats.active} />
            </CardContent>
          </Card>

          <Card className={detailCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building className="h-4 w-4" /> Builder Connections</CardTitle>
              <CardDescription>Preferred builder and development relationships.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {showcase.builderConnections.map((builder) => (
                <div key={builder} className={`${tileClass} text-sm font-medium`}>
                  {builder}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={detailCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" /> Market Impact</CardTitle>
              <CardDescription>Performance highlights and operational outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {showcase.impact.map((item) => (
                <div key={item} className={`${tileClass} text-sm`}>
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card id="agent-reviews" className={detailCardClass}>
          <CardHeader>
            <CardTitle>Client Reviews</CardTitle>
            <CardDescription>Recent feedback from buyers and sellers represented by {agent.name}.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showcase.reviews.map((review) => (
              <div key={`${review.name}-${review.role}`} className="rounded-xl border border-primary/20 p-4 space-y-2 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={detailCardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-4 w-4" /> Deal Specialties</CardTitle>
            <CardDescription>Domains where this agent consistently performs.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {agent.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="bg-primary/10 border-primary/20 px-3 py-1">
                {specialty}
              </Badge>
            ))}
            {[
              "Commercial Transactions",
              "New Development",
              "Rental Advisory",
              "Buyer Representation",
              "Seller Representation",
            ].map((extra) => (
              <Badge key={extra} variant="outline" className="px-3 py-1">
                {extra}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">Agent Performance Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className={detailCardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">{closeRate}%</p>
                <p className="text-sm font-semibold">Close reliability</p>
                <p className="text-xs text-muted-foreground">
                  Deal execution quality with consistent buyer/seller communication and transaction discipline.
                </p>
              </CardContent>
            </Card>
            <Card className={detailCardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">{agent.stats.sold}</p>
                <p className="text-sm font-semibold">Closed transactions</p>
                <p className="text-xs text-muted-foreground">
                  Production cadence across buy, sell, lease, and specialty listing assignments.
                </p>
              </CardContent>
            </Card>
            <Card className={detailCardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">{showcase.coverageAreas.length}</p>
                <p className="text-sm font-semibold">Coverage markets</p>
                <p className="text-xs text-muted-foreground">
                  Territory span with active representation across high-intent neighborhoods.
                </p>
              </CardContent>
            </Card>
            <Card className={detailCardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">{agent.rating.toFixed(1)}</p>
                <p className="text-sm font-semibold">Client rating</p>
                <p className="text-xs text-muted-foreground">
                  Trust and satisfaction signal from buyers, sellers, and repeat clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">Agent Case Highlights</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto">
            Spotlight workstreams showing how {agent.name} drives pricing strategy, pipeline conversion, and close confidence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: `${agent.name} Listing Strategy`,
                text: `${agent.specialties.slice(0, 2).join(" and ")} focused strategy in ${agent.location}.`,
              },
              {
                title: "Buyer Pipeline Program",
                text: "Structured buyer qualification and offer sequencing to improve close certainty and cycle speed.",
              },
              {
                title: "Referral Network Expansion",
                text: "Cross-functional lender, builder, and legal referrals supporting smoother multi-party transactions.",
              },
            ].map((item) => (
              <Card key={item.title} className={detailCardClass}>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold leading-tight">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="agent-contact" className="rounded-2xl border border-primary/25 bg-gradient-to-br from-background via-primary/5 to-background p-6 shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Work With {agent.name}</h3>
              <p className="text-sm text-muted-foreground">
                Ready to buy, sell, or invest in {agent.location}? Start a direct conversation.
              </p>
            </div>
            <div className="flex gap-2">
              <Button>Message Agent</Button>
              <Button variant="outline">Schedule Call</Button>
            </div>
          </div>
        </section>
      </div>
      <ChatbotFab
        title="Agent Concierge"
        placeholder={`Ask about ${agent.name}'s listings, specialties, and network`}
      />
    </DottedSurface>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-primary/25 bg-gradient-to-br from-background via-primary/5 to-background shadow-[0_8px_24px_rgba(59,130,246,0.08)]">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function PipelineMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
