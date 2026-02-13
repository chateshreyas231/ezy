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
import {
  ArrowLeft,
  Award,
  Compass,
  Crown,
  Globe,
  Handshake,
  LandPlot,
  MessageSquare,
  Star,
  Target,
  Users,
} from "lucide-react";

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
  pipeline: {
    inTalksWithBuyers: number;
    inTalksWithSellers: number;
    institutionalLeads: number;
    offMarketMandates: number;
  };
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
  partnerNetwork: {
    builders: number;
    lenders: number;
    legalPartners: number;
    stagingVendors: number;
  };
};

const BROKER_PROFILES: Record<string, BrokerProfile> = {
  "broker-1": {
    history:
      "Founded in 2008 as a boutique Beverly Hills advisory, Elite Realty Group scaled into a multi-market brokerage by combining high-touch client service with disciplined transaction systems.",
    values: ["Trust-first representation", "Data-driven pricing", "Disciplined negotiation", "Fast-close operations"],
    testimonials: [
      {
        name: "Natalie Brooks",
        role: "Luxury Seller",
        text: "Elite's team orchestrated everything from staging to offer strategy. We closed above ask with clean terms.",
        rating: 5,
      },
      {
        name: "Kevin Tran",
        role: "Buyer",
        text: "They matched us with the right agent and lender partner quickly. The process felt highly coordinated.",
        rating: 5,
      },
    ],
    targets: [
      { label: "Quarterly Volume Goal", progress: 78, note: "On track to exceed target by 8%." },
      { label: "New Development Mandates", progress: 62, note: "Two mandates currently in legal finalization." },
      { label: "Luxury Segment Share", progress: 71, note: "Strong momentum in waterfront submarket." },
    ],
    pipeline: { inTalksWithBuyers: 34, inTalksWithSellers: 26, institutionalLeads: 7, offMarketMandates: 12 },
    dealMix: { residentialBuy: 28, residentialSell: 31, rentals: 12, commercial: 11, newDevelopment: 18 },
    rankings: { cityRank: 3, regionalRank: 5, luxuryRank: 2 },
    partnerNetwork: { builders: 14, lenders: 18, legalPartners: 10, stagingVendors: 22 },
  },
};

function fallbackProfile(): BrokerProfile {
  return {
    history:
      "This brokerage has grown through a combination of agent development, disciplined transaction management, and regional expansion.",
    values: ["Client advocacy", "Operational excellence", "Market intelligence", "Long-term relationships"],
    testimonials: [
      {
        name: "Jordan Lee",
        role: "Seller",
        text: "The broker team paired us with the right listing strategy and moved quickly from launch to close.",
        rating: 5,
      },
      {
        name: "Avery Cole",
        role: "Investor",
        text: "Clear communication and strong support from underwriting to negotiations.",
        rating: 4,
      },
    ],
    targets: [
      { label: "Annual Revenue Goal", progress: 65, note: "Healthy Q2 pipeline supports upside." },
      { label: "Agent Productivity", progress: 74, note: "Training cohort improving close cycle speed." },
      { label: "Commercial Expansion", progress: 58, note: "Focused push in mixed-use and office leases." },
    ],
    pipeline: { inTalksWithBuyers: 21, inTalksWithSellers: 19, institutionalLeads: 4, offMarketMandates: 8 },
    dealMix: { residentialBuy: 30, residentialSell: 29, rentals: 16, commercial: 12, newDevelopment: 13 },
    rankings: { cityRank: 6, regionalRank: 9, luxuryRank: 7 },
    partnerNetwork: { builders: 10, lenders: 14, legalPartners: 8, stagingVendors: 16 },
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
  const cardClass = "border-neutral-200 bg-white shadow-sm";
  const tileClass = "rounded-lg border border-neutral-200 bg-[#fafafa] p-3";

  return (
    <DottedSurface className="min-h-screen pt-24 pb-14 px-4 md:px-8 [--dot-color:#e6e6e6] bg-[#f9f9f9]">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button variant="outline" asChild>
          <Link href="/explore/broker">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to broker directory
          </Link>
        </Button>

        <AboutSection3
          sectionLabel="WHO WE ARE"
          brandName={broker.name}
          roleLabel={`${broker.headquarters} • Broker Leadership`}
          heroImage={listings[0]?.images[0] ?? broker.logo}
          yearsExperience={`${Math.max(1, new Date().getFullYear() - broker.foundedYear)}+ years`}
          metricOneLabel="of market execution"
          metricTwoValue={`${broker.stats.totalSold}+`}
          metricTwoLabel="brokered transactions"
          heading="Driving brokerage performance through systems, people, and market intelligence."
          paragraphOne={profile.history}
          paragraphTwo={`${broker.name} operates across ${broker.serviceAreas.join(", ")} with core specialization in ${broker.specializations.join(", ")}.`}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MiniStat label="Agent Count" value={`${broker.agents.length}`} />
          <MiniStat label="Active Listings" value={`${broker.stats.activeListings}`} />
          <MiniStat label="Avg Rating" value={broker.stats.averageRating.toFixed(1)} />
          <MiniStat label="Avg Deal" value={formatMoney(avgDeal)} />
          <MiniStat label="YoY Growth" value={`+${broker.stats.yearlyGrowth.toFixed(1)}%`} />
          <MiniStat label="Regional Rank" value={`#${profile.rankings.regionalRank}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 ${cardClass}`}>
            <CardHeader>
              <CardTitle>Ownership, History, and Leadership</CardTitle>
              <CardDescription>Broker identity, operating model, and strategic history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-neutral-200 p-4 bg-[#fafafa]">
                <p className="text-sm text-muted-foreground">{profile.history}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoBox icon={<Crown className="h-4 w-4" />} label="Owner" value={broker.owner} />
                <InfoBox icon={<Users className="h-4 w-4" />} label="Managing Partners" value={broker.managingPartners.join(", ")} />
                <InfoBox icon={<Compass className="h-4 w-4" />} label="Service Areas" value={broker.serviceAreas.join(", ")} />
                <InfoBox icon={<Award className="h-4 w-4" />} label="Core Specializations" value={broker.specializations.join(", ")} />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>Competitive standing by category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <RankRow label="City Rank" value={profile.rankings.cityRank} />
              <RankRow label="Regional Rank" value={profile.rankings.regionalRank} />
              <RankRow label="Luxury Segment" value={profile.rankings.luxuryRank} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Handshake className="h-4 w-4" /> Connection Network</CardTitle>
              <CardDescription>Broker-side execution network and partner stack.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <NetworkTile label="Builders" value={profile.partnerNetwork.builders} />
              <NetworkTile label="Lenders" value={profile.partnerNetwork.lenders} />
              <NetworkTile label="Legal" value={profile.partnerNetwork.legalPartners} />
              <NetworkTile label="Staging" value={profile.partnerNetwork.stagingVendors} />
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> In Talks</CardTitle>
              <CardDescription>Current demand pipeline across buyers/sellers/institutions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <PipelineRow label="Buyer Conversations" value={profile.pipeline.inTalksWithBuyers} />
              <PipelineRow label="Seller Conversations" value={profile.pipeline.inTalksWithSellers} />
              <PipelineRow label="Institutional Leads" value={profile.pipeline.institutionalLeads} />
              <PipelineRow label="Off-Market Mandates" value={profile.pipeline.offMarketMandates} />
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4" /> Strategic Targets</CardTitle>
              <CardDescription>Short-term goals, progress, and operating focus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.targets.map((target) => (
                <div key={target.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{target.label}</span>
                    <span className="font-semibold">{target.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400/70 to-orange-500" style={{ width: `${target.progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{target.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 ${cardClass}`}>
            <CardHeader>
              <CardTitle>Agent Roster and Rankings</CardTitle>
              <CardDescription>Lead agents, production ranking, and listing contribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roster.map((agent, idx) => {
                const listingCount = MOCK_LISTINGS.filter((listing) => listing.agentId === agent!.id).length;
                return (
                  <Link key={agent!.id} href={`/explore/agent/${agent!.id}`}>
                    <div className="rounded-xl border border-neutral-200 p-3 hover:border-red-300 transition-colors flex items-center justify-between gap-3 bg-[#fafafa]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center text-xs font-semibold">
                          #{idx + 1}
                        </div>
                        <img src={agent!.avatar} alt={agent!.name} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{agent!.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{agent!.specialties.join(" • ")}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{agent!.stats.sold} deals</p>
                        <p className="text-xs text-muted-foreground">{listingCount} listings</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LandPlot className="h-4 w-4" /> Deal Mix</CardTitle>
              <CardDescription>Buy/Sell/Rent/Commercial/New development share.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MIX_ROWS.map((row) => {
                const value = profile.dealMix[row.key];
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{row.label}</span>
                      <span className="font-semibold">{value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400/70 to-orange-500" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 ${cardClass}`}>
            <CardHeader>
              <CardTitle>Listings Under Brokerage</CardTitle>
              <CardDescription>Representative active inventory across the brokerage network.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.slice(0, 4).map((listing) => (
                <Link key={listing.id} href={`/explore/agent/listing/${listing.id}`}>
                  <div className="rounded-xl border border-neutral-200 overflow-hidden hover:border-red-300 transition-colors bg-[#fafafa]">
                    <img src={listing.images[0]} alt={listing.title} className="h-36 w-full object-cover" />
                    <div className="p-3 space-y-1">
                      <p className="font-semibold">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.location}</p>
                      <p className="text-sm font-medium">{formatMoney(listing.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" /> Brand Values</CardTitle>
              <CardDescription>Culture pillars used to drive hiring and delivery quality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.values.map((value) => (
                <div key={value} className={`${tileClass} text-sm`}>
                  {value}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle>Reviews and Testimonials</CardTitle>
            <CardDescription>Feedback from clients and investment partners.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.testimonials.map((review) => (
              <div key={`${review.name}-${review.role}`} className="rounded-xl border border-neutral-200 p-4 space-y-2 bg-[#fafafa]">
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

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">Broker Performance Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className={cardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">99.2%</p>
                <p className="text-sm font-semibold">SLA compliance</p>
                <p className="text-xs text-muted-foreground">
                  Broker Governance: compliance, risk controls, and deal oversight in daily workflows.
                </p>
              </CardContent>
            </Card>
            <Card className={cardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">3.4x</p>
                <p className="text-sm font-semibold">Pipeline velocity</p>
                <p className="text-xs text-muted-foreground">
                  Agent Productivity: monitor team velocity, active pipelines, and conversion performance.
                </p>
              </CardContent>
            </Card>
            <Card className={cardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">{Math.max(12, broker.serviceAreas.length * 8)}</p>
                <p className="text-sm font-semibold">Active territories</p>
                <p className="text-xs text-muted-foreground">
                  Portfolio Coverage: residential, commercial, rentals, and new development visibility by market.
                </p>
              </CardContent>
            </Card>
            <Card className={cardClass}>
              <CardContent className="p-4 space-y-2">
                <p className="text-3xl font-bold">+{broker.stats.yearlyGrowth.toFixed(1)}%</p>
                <p className="text-sm font-semibold">YoY growth</p>
                <p className="text-xs text-muted-foreground">
                  Growth Intelligence: forecast targets, benchmark market performance, and identify expansion opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">Brokerage Case Highlights</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto">
            See how {broker.name} is scaling listings, improving close rates, and building stronger partner networks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: `${broker.name} Growth Playbook`,
                text: `${broker.tagline} Focus areas: ${broker.specializations.slice(0, 2).join(" and ")}.`,
              },
              {
                title: "Pipeline Acceleration Program",
                text: "Operational changes that reduced cycle time from intake to close across the top-producing teams.",
              },
              {
                title: "Market Expansion Blueprint",
                text: "Territory-led expansion strategy balancing high-intent neighborhoods with long-term growth zones.",
              },
            ].map((item) => (
              <Card key={item.title} className={cardClass}>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold leading-tight">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">Brokerage Infrastructure That Scales</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto">
            Built for multi-agent teams, complex pipelines, and high-performance market execution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={cardClass}>
              <CardContent className="p-4">
                <p className="font-semibold mb-1">Broker Governance</p>
                <p className="text-sm text-muted-foreground">
                  Compliance health, risk controls, and deal-level approvals visible across every operating team.
                </p>
              </CardContent>
            </Card>
            <Card className={cardClass}>
              <CardContent className="p-4">
                <p className="font-semibold mb-1">Market Capture</p>
                <p className="text-sm text-muted-foreground">
                  AI-assisted opportunity tracking in target neighborhoods and strategic listing corridors.
                </p>
              </CardContent>
            </Card>
            <Card className={cardClass}>
              <CardContent className="p-4">
                <p className="font-semibold mb-1">Training & Playbooks</p>
                <p className="text-sm text-muted-foreground">
                  Centralized onboarding, negotiation playbooks, and team rituals that keep execution consistent.
                </p>
              </CardContent>
            </Card>
            <Card className={cardClass}>
              <CardContent className="p-4">
                <p className="font-semibold mb-1">Territory Coverage</p>
                <p className="text-sm text-muted-foreground">
                  Service area saturation maps, expansion scoring, and partner network impact by micro-market.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <ChatbotFab
        title="Broker Concierge"
        placeholder={`Ask about ${broker.name} rankings, agents, listings, and targets`}
      />
    </DottedSurface>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-neutral-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold mt-1 text-red-500">{value}</p>
      </CardContent>
    </Card>
  );
}

function InfoBox({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-[#fafafa] p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        {icon} {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function RankRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-[#fafafa] p-3 flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Badge variant="secondary" className="bg-red-50 text-red-500 border-red-200">#{value}</Badge>
    </div>
  );
}

function NetworkTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-[#fafafa] p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-red-500">{value}</p>
    </div>
  );
}

function PipelineRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-[#fafafa] p-3 flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className="font-semibold text-red-500">{value}</span>
    </div>
  );
}
