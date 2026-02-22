"use client";

import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import AboutSection3 from "@/components/ui/about-section";
import { Button } from "@/components/ui/button";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { MOCK_AGENTS, MOCK_BROKERS, MOCK_LISTINGS } from "@/lib/mock-data";
import { ArrowLeft, Award, Compass, Crown, Star, TrendingUp, Users } from "lucide-react";

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

type BrokerProfile = {
  history: string;
  values: string[];
  testimonials: Array<{ name: string; role: string; text: string; rating: number }>;
  targets: Array<{ label: string; progress: number; note: string }>;
  dealMix: {
    residentialBuy: number;
    residentialSell: number;
    rentals: number;
    commercial: number;
    newDevelopment: number;
  };
  rankings: {
    cityRank: number;
    regionalRank: number;
    luxuryRank: number;
  };
};

const BROKER_PROFILES: Record<string, BrokerProfile> = {
  "broker-1": {
    history:
      "Founded in 2008 in Beverly Hills, Elite Realty Group expanded into multiple markets through standardized workflow systems.",
    values: ["Client communication", "Pricing process", "Negotiation process", "Operational consistency"],
    testimonials: [
      {
        name: "Natalie Brooks",
        role: "Luxury Seller",
        text: "The team coordinated staging, documentation, and communication clearly from listing to close.",
        rating: 5,
      },
      {
        name: "Kevin Tran",
        role: "Buyer",
        text: "The process felt organized, with clear handoffs between participants.",
        rating: 5,
      },
    ],
    targets: [
      { label: "Quarterly Volume Goal", progress: 78, note: "Current activity is tracking near target." },
      { label: "New Development Mandates", progress: 62, note: "Two mandates currently in legal finalization." },
      { label: "Luxury Segment Share", progress: 71, note: "Strong momentum in waterfront submarket." },
    ],
    dealMix: { residentialBuy: 28, residentialSell: 31, rentals: 12, commercial: 11, newDevelopment: 18 },
    rankings: { cityRank: 3, regionalRank: 5, luxuryRank: 2 },
  },
};

function fallbackProfile(): BrokerProfile {
  return {
    history:
      "This brokerage has grown through agent development, workflow management, and regional expansion.",
    values: ["Client support", "Operational consistency", "Market information", "Long-term relationships"],
    testimonials: [
      {
        name: "Jordan Lee",
        role: "Seller",
        text: "The team shared clear listing updates and timeline coordination from launch to close.",
        rating: 5,
      },
      {
        name: "Avery Cole",
        role: "Investor",
        text: "Clear communication and steady support from underwriting through closing steps.",
        rating: 4,
      },
    ],
    targets: [
      { label: "Annual Revenue Goal", progress: 65, note: "Healthy Q2 pipeline supports upside." },
      { label: "Agent Productivity", progress: 74, note: "Training cohort improving close cycle speed." },
      { label: "Commercial Expansion", progress: 58, note: "Focused push in mixed-use and office leases." },
    ],
    dealMix: { residentialBuy: 30, residentialSell: 29, rentals: 16, commercial: 12, newDevelopment: 13 },
    rankings: { cityRank: 6, regionalRank: 9, luxuryRank: 7 },
  };
}

const MIX_ROWS: Array<{ key: keyof BrokerProfile["dealMix"]; label: string }> = [
  { key: "residentialBuy", label: "Residential Buy" },
  { key: "residentialSell", label: "Residential Sell" },
  { key: "rentals", label: "Rentals" },
  { key: "commercial", label: "Commercial" },
  { key: "newDevelopment", label: "New Development" },
];

export default function BrokerDetailPage() {
  const params = useParams<{ id: string }>();
  const broker = useMemo(() => MOCK_BROKERS.find((item) => item.id === params.id), [params.id]);

  if (!broker) {
    return (
      <DottedSurface className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="outline" asChild>
            <Link href="/explore/broker">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to broker directory
            </Link>
          </Button>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Broker not found.</CardContent>
          </Card>
        </div>
      </DottedSurface>
    );
  }

  const profile = BROKER_PROFILES[broker.id] ?? fallbackProfile();
  const roster = broker.agents
    .map((agentId) => MOCK_AGENTS.find((agent) => agent.id === agentId))
    .filter(Boolean);
  const listings = MOCK_LISTINGS.filter((listing) => broker.agents.includes(listing.agentId));
  const avgDeal = broker.stats.totalSold === 0 ? 0 : Math.round(broker.stats.totalVolume / broker.stats.totalSold);

  return (
    <DottedSurface className="min-h-screen pt-24 pb-14 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button variant="outline" asChild>
          <Link href="/explore/broker">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to broker directory
          </Link>
        </Button>

        <AboutSection3
          sectionLabel="BROKER PROFILE"
          brandName={broker.name}
          roleLabel={`${broker.headquarters} • Brokerage Leadership`}
          heroImage={listings[0]?.images[0] ?? broker.logo}
          yearsExperience={`${Math.max(1, new Date().getFullYear() - broker.foundedYear)}+ years`}
          metricOneLabel="of market execution"
          metricTwoValue={`${broker.stats.totalSold}+`}
          metricTwoLabel="closed workflows"
          heading="Broker profile and organization overview."
          paragraphOne={profile.history}
          paragraphTwo={`${broker.name} operates across ${broker.serviceAreas.join(", ")} with specialization in ${broker.specializations.join(", ")}.`}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Agents" value={`${broker.agents.length}`} />
          <MiniStat label="Active Listings" value={`${broker.stats.activeListings}`} />
          <MiniStat label="Total Volume" value={formatMoney(broker.stats.totalVolume)} />
          <MiniStat label="Avg Rating" value={broker.stats.averageRating.toFixed(1)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Broker Snapshot</CardTitle>
              <CardDescription>Ownership, leadership, service footprint, and brand principles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoBox icon={<Crown className="h-4 w-4" />} label="Owner" value={broker.owner} />
                <InfoBox icon={<Users className="h-4 w-4" />} label="Managing Partners" value={broker.managingPartners.join(", ")} />
                <InfoBox icon={<Compass className="h-4 w-4" />} label="Service Areas" value={broker.serviceAreas.join(", ")} />
                <InfoBox icon={<Award className="h-4 w-4" />} label="Core Specializations" value={broker.specializations.join(", ")} />
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground mb-2">Brand values</p>
                <div className="flex flex-wrap gap-2">
                  {profile.values.map((value) => (
                    <Badge key={value} variant="secondary" className="bg-card border-border text-foreground">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Performance</CardTitle>
              <CardDescription>Self-reported metrics for organization review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PerfRow label="City Cohort" value={`#${profile.rankings.cityRank}`} />
              <PerfRow label="Regional Cohort" value={`#${profile.rankings.regionalRank}`} />
              <PerfRow label="Luxury Cohort" value={`#${profile.rankings.luxuryRank}`} />
              <PerfRow label="Avg Deal" value={formatMoney(avgDeal)} />
              <PerfRow label="YoY Growth" value={`+${broker.stats.yearlyGrowth.toFixed(1)}%`} />

              <div className="space-y-3 pt-2">
                {profile.targets.slice(0, 2).map((target) => (
                  <div key={target.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{target.label}</span>
                      <span className="font-semibold">{target.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${target.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                {MIX_ROWS.slice(0, 3).map((row) => {
                  const value = profile.dealMix[row.key];
                  return (
                    <div key={row.key} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{row.label}</span>
                      <span className="font-medium text-foreground">{value}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Agent Profiles</CardTitle>
              <CardDescription>Team members listed by participant-submitted activity details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roster.map((agent, idx) => {
                const listingCount = MOCK_LISTINGS.filter((listing) => listing.agentId === agent!.id).length;
                return (
                  <Link key={agent!.id} href={`/explore/agent/${agent!.id}`}>
                    <div className="rounded-xl border border-border bg-muted/40 p-3 transition-colors hover:border-primary/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold">
                          #{idx + 1}
                        </div>
                        <img src={agent!.avatar} alt={agent!.name} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{agent!.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{agent!.specialties.join(" • ")}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{agent!.stats.sold} deals</p>
                        <p className="text-muted-foreground">{listingCount} listings</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Featured Listings</CardTitle>
              <CardDescription>Current inventory represented by this brokerage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {listings.slice(0, 4).map((listing) => (
                <Link key={listing.id} href={`/explore/agent/listing/${listing.id}`}>
                  <div className="rounded-xl border border-border bg-muted/40 overflow-hidden transition-colors hover:border-primary/30">
                    <img src={listing.images[0]} alt={listing.title} className="h-36 w-full object-cover" />
                    <div className="p-3">
                      <p className="font-semibold line-clamp-1">{listing.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{listing.location}</p>
                      <p className="text-sm font-medium mt-1">{formatMoney(listing.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Client Reviews</CardTitle>
              <CardDescription>User-submitted feedback from buyers, sellers, and partners.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button>Contact Brokerage</Button>
              <Button variant="outline">Share Profile</Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.testimonials.map((review) => (
              <div key={`${review.name}-${review.role}`} className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
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
      </div>

      <div className="max-w-7xl mx-auto mt-2 text-xs text-muted-foreground">
        Broker profile details and metrics are participant-submitted and informational only. Ezriya does not endorse, verify, or recommend broker organizations.
      </div>

      <ChatbotFab
        title="Broker Information Assistant"
        placeholder={`Ask for information about ${broker.name} team details, listings, and self-reported metrics`}
      />
    </DottedSurface>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold mt-1 text-orange-600">{value}</p>
      </CardContent>
    </Card>
  );
}

function InfoBox({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        {icon} {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function PerfRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
