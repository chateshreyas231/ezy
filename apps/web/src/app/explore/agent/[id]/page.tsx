"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { FreelancerStatsCard } from "@/components/ui/stats-card";
import { HealthStatCard } from "@/components/ui/health-stat-card";
import { type Story } from "@/components/ui/story-viewer";
import { MOCK_AGENTS, MOCK_LISTINGS } from "@/lib/mock-data";
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  MessageSquare,
  Activity,
  Sparkles,
  Star,
  TrendingUp,
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

const glassPanel =
  "border border-primary/15 bg-card/65 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,119,255,0.08)]";
const StoryViewer = dynamic(
  () => import("@/components/ui/story-viewer").then((module) => module.StoryViewer),
  { ssr: false },
);

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

  const listings = MOCK_LISTINGS.filter((listing) => listing.agentId === agent.id);
  const listingStories = listings
    .map((listing) => ({
      id: listing.id,
      username: listing.title,
      avatar: listing.images[0] || agent.avatar,
      stories: listing.images.map((image, index) => ({
        id: `${listing.id}-story-${index + 1}`,
        type: "image" as const,
        src: image,
      })) satisfies Story[],
    }))
    .filter((entry) => entry.stories.length > 0);
  const averageDeal = agent.stats.sold === 0 ? 0 : Math.round(agent.stats.volume / agent.stats.sold);
  const closeRate = Math.min(97, 72 + Math.round(agent.rating * 4) + Math.floor(agent.experienceYears / 2));
  const rankingIndex = Math.max(MOCK_AGENTS.findIndex((entry) => entry.id === agent.id), 0) + 1;
  const topRank = Math.min(rankingIndex, 10);
  const recentDeals = Math.max(1, Math.round(agent.stats.sold * 0.15));
  const medianDom = Math.max(14, 34 - Math.round((agent.experienceYears / 20) * 14));
  const listToSale = (97.2 + (agent.rating - 4.5) * 1.6).toFixed(1);
  const responseMinutes = Math.max(9, 32 - Math.round(agent.rating * 3));
  const coverageAreas = [agent.location, "Downtown", "Waterfront", "Growth Corridor"];
  const modernStatsData = {
    freelancerCard: {
      title: "Participant Metrics",
      timeFrame: "YTD",
      metricLabel: "Self-Reported Closed Volume",
      earnings: {
        amount: agent.stats.volume,
        change: 0,
        changePeriod: "vs same period last year",
        changeDisplay: "+11% vs same period last year",
      },
      subStats: [
        { value: agent.stats.active, label: "active", subLabel: "live listings" },
        { value: recentDeals, label: "closed", subLabel: "last 90 days" },
      ] as [{ value: number; label: string; subLabel: string }, { value: number; label: string; subLabel: string }],
      ranking: {
        place: `Brokerage cohort ${topRank}`,
        category: "participant-submitted activity context",
        icon: <TrendingUp className="h-6 w-6 opacity-60" />,
      },
      availability: {
        title: "Deal Pipeline",
        bars: Array.from({ length: 24 }, (_, index) => {
          const base = (agent.rating / 5) * 0.75;
          const wave = Math.sin(index / 3) * 0.16;
          const level = Math.max(0.1, Math.min(1, base + wave));
          return { level };
        }),
        label: `${agent.stats.active} active opportunities`,
        helpText: `Participant-submitted pipeline includes ${agent.stats.active} active listings and ${recentDeals} recent closings (last 90 days).`,
      },
    },
    healthCard: {
      stats: [
        { title: "DOM", value: medianDom, unit: "days", changePercent: 6, changeDirection: "up" as const },
        { title: "List/Sale", value: listToSale, unit: "%", changePercent: 2, changeDirection: "up" as const },
        { title: "Response", value: responseMinutes, unit: "min", changePercent: 9, changeDirection: "up" as const },
      ],
      graphData: [
        { label: "Lead quality", value: 88, color: "#3B82F6", description: "Qualified buyer opportunities" },
        { label: "Conversion", value: 72, color: "#22C55E", description: "Lead to closed-deal efficiency" },
        { label: "Response", value: 81, color: "#F59E0B", description: "Client response consistency" },
      ],
    },
  };

  return (
    <DottedSurface className="min-h-screen pt-24 pb-14 px-4 md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(0,119,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,119,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_65%)]" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <Button variant="outline" asChild>
          <Link href="/explore/agent">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all agents
          </Link>
        </Button>

        <section className={`rounded-3xl p-6 md:p-8 ${glassPanel}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8">
              <Badge variant="outline" className="border-primary/25 bg-card/80 text-primary mono tracking-[0.18em] uppercase text-[10px]">
                Agent Profile
              </Badge>
              <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">{agent.name}</h1>
              <p className="mt-2 text-muted-foreground text-lg">
                Participant-stated real estate services and experience areas.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                All profile information is participant-submitted and provided for informational purposes only. Ezriya does not endorse, verify, or recommend agents and does not participate in pricing, negotiation, or transaction conduct.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 md:flex-nowrap md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {agent.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button asChild variant="outline" size="icon-sm" aria-label="Instagram">
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">
                      <img
                        src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/instagram-icon.png?width=20&height=20&format=auto"
                        alt="Instagram"
                        className="size-4"
                      />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="icon-sm" aria-label="TikTok">
                    <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                      <img
                        src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/tiktok-icon.png?width=20&height=20&format=auto"
                        alt="TikTok"
                        className="size-4"
                      />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="icon-sm" aria-label="Email">
                    <a href={`mailto:hello@ezriya.ai?subject=Connect%20with%20${encodeURIComponent(agent.name)}`}>
                      <img
                        src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
                        alt="Email"
                        className="size-4"
                      />
                    </a>
                  </Button>
                </div>
              </div>

            </div>

            <div className="lg:col-span-4 rounded-2xl border border-primary/15 bg-card/75 p-5">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-3">Self-Reported Activity</p>
              <p className="text-3xl font-semibold">{formatMoney(agent.stats.volume)}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" /> User-submitted year-over-year trend
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1">Message Agent</Button>
                <Button variant="outline" className="flex-1">Schedule Call</Button>
              </div>

            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <Card className={`${glassPanel} rounded-3xl`}>
              <CardContent className="p-5 space-y-3">
                <p className="mono text-[10px] uppercase tracking-[0.2em] text-primary/70">Command Center</p>
                <Metric icon={<Users className="h-4 w-4" />} label="Closed Deals" value={`${agent.stats.sold}`} />
                <Metric icon={<Building2 className="h-4 w-4" />} label="Active Listings" value={`${agent.stats.active}`} />
                <Metric icon={<Star className="h-4 w-4" />} label="Rating" value={agent.rating.toFixed(1)} />
                <Metric icon={<TrendingUp className="h-4 w-4" />} label="Completion Ratio" value={`${closeRate}%`} />
              </CardContent>
            </Card>

            <Card className={`${glassPanel} rounded-3xl`}>
              <CardContent className="p-5 space-y-3">
                <p className="mono text-[10px] uppercase tracking-[0.2em] text-primary/70">Coverage</p>
                {coverageAreas.map((area) => (
                  <div key={area} className="rounded-xl border border-primary/10 bg-card/70 p-3 text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {area}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={`${glassPanel} rounded-3xl`}>
              <CardContent className="p-5 space-y-3">
                <p className="mono text-[10px] uppercase tracking-[0.2em] text-primary/70">Information</p>
                <div className="rounded-xl border border-primary/10 bg-card/70 p-4">
                  <p className="text-sm text-muted-foreground">Average deal size</p>
                  <p className="text-xl font-semibold">{formatMoney(averageDeal)}</p>
                </div>
                <div className="rounded-xl border border-primary/10 bg-card/70 p-4">
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-xl font-semibold">{agent.experienceYears} years</p>
                </div>
                <div className="rounded-xl border border-primary/10 bg-card/70 p-4">
                  <p className="text-sm text-muted-foreground">Network Coverage</p>
                  <p className="text-xl font-semibold">Participant-stated</p>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="lg:col-span-6 space-y-4">
            <Card className={`${glassPanel} rounded-3xl`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Listings Portfolio</h2>
                  <Badge variant="outline" className="bg-card/80">{listings.length} active</Badge>
                </div>

                {listingStories.length > 0 ? (
                  <div className="mb-5">
                    <p className="mono text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-2">Listing Stories</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {listingStories.map((storySet) => (
                        <StoryViewer
                          key={storySet.id}
                          stories={storySet.stories}
                          username={storySet.username}
                          avatar={storySet.avatar}
                          onStoryView={() => {}}
                          onAllStoriesViewed={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.length === 0 ? (
                    <div className="col-span-2 rounded-xl border border-dashed border-primary/20 p-8 text-center text-muted-foreground">
                      No active listings available.
                    </div>
                  ) : (
                    listings.map((listing) => (
                      <Link key={listing.id} href={`/explore/agent/listing/${listing.id}`}>
                        <div className="rounded-xl border border-primary/15 bg-card/75 overflow-hidden hover:border-primary/30 transition-all">
                          <img src={listing.images[0]} alt={listing.title} className="h-40 w-full object-cover" />
                          <div className="p-3 space-y-1">
                            <p className="font-semibold line-clamp-1">{listing.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{listing.location}</p>
                            <p className="text-sm font-medium">{formatMoney(listing.price)}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <FreelancerStatsCard
                className="max-w-none border-primary/20 bg-gradient-to-b from-card/80 to-primary/10 backdrop-blur-sm"
                {...modernStatsData.freelancerCard}
              />
            </div>

          </section>

          <aside className="lg:col-span-3 space-y-4">

            <Card className={`${glassPanel} rounded-3xl`}>
              <CardContent className="p-5 space-y-3">
                <p className="mono text-[10px] uppercase tracking-[0.2em] text-primary/70">AI Assistant</p>
                <div className="rounded-xl border border-primary/10 bg-card/70 p-4 text-sm text-muted-foreground">
                  Ask for information on participant metrics, listing details, and local activity signals.
                </div>
                <Button className="w-full"><MessageSquare className="mr-2 h-4 w-4" /> Start AI Summary</Button>
                <Button variant="outline" className="w-full"><Sparkles className="mr-2 h-4 w-4" /> Generate Prospectus</Button>
                <Button variant="outline" className="w-full"><Globe className="mr-2 h-4 w-4" /> Share Public Profile</Button>
              </CardContent>
            </Card>



            <HealthStatCard
              className="max-w-none border-primary/20 bg-gradient-to-b from-card/80 to-primary/10 backdrop-blur-sm"
              headerIcon={<Activity className="h-5 w-5" />}
              title="Seller Confidence Signals"
              stats={modernStatsData.healthCard.stats}
              graphData={modernStatsData.healthCard.graphData}
              graphHeight={110}
            />

            <Card className={`${glassPanel} rounded-3xl`}>
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold mb-4">Client Reviews</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Communication was clear throughout the process.",
                    "Responsive to questions and scheduling requests.",
                    "Professional interactions across milestones.",
                    "Consistent follow-through and workflow updates.",
                  ].map((quote) => (
                    <div key={quote} className="rounded-xl border border-primary/10 bg-card/70 p-4 text-sm text-muted-foreground">
                      {quote}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


          </aside>
        </section>
      </div>

      <ChatbotFab
        title="Agent Information Assistant"
        placeholder={`Ask for information about ${agent.name}'s listings, focus areas, and profile details`}
      />
    </DottedSurface>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary/10 bg-card/70 p-3 flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
