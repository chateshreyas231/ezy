"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DottedSurface } from "@/components/ui/dotted-surface";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_AGENTS, MOCK_LISTINGS } from "@/lib/mock-data";
import {
  ArrowRight,
  Award,
  Building2,
  DollarSign,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Timer,
  Trophy,
  UserRoundCheck,
} from "lucide-react";

const TOP_PRODUCER_DEALS = 40;

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

function getAverageDealPrice(volume: number, sold: number): number {
  if (sold === 0) return 0;
  return Math.round(volume / sold);
}

function getAgentListingImage(agentId: string): string {
  return (
    MOCK_LISTINGS.find((listing) => listing.agentId === agentId)?.images[0] ??
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&fit=crop"
  );
}

export default function AgentPage() {
  const filteredAgents = useMemo(() => {
    return [...MOCK_AGENTS].sort((a, b) => b.stats.sold - a.stats.sold);
  }, []);

  const topProducers = useMemo(
    () => MOCK_AGENTS.filter((agent) => agent.stats.sold >= TOP_PRODUCER_DEALS).sort((a, b) => b.stats.sold - a.stats.sold),
    [],
  );

  const headlineStats = useMemo(() => {
    const totalVolume = MOCK_AGENTS.reduce((sum, agent) => sum + agent.stats.volume, 0);
    const totalActive = MOCK_AGENTS.reduce((sum, agent) => sum + agent.stats.active, 0);
    const avgRating = MOCK_AGENTS.reduce((sum, agent) => sum + agent.rating, 0) / MOCK_AGENTS.length;

    return {
      totalVolume,
      totalActive,
      avgRating,
      totalAgents: MOCK_AGENTS.length,
    };
  }, []);

  return (
    <DottedSurface className="min-h-screen pt-24 pb-16 px-3 md:px-8 xl:px-12">
      <div className="max-w-[1220px] mx-auto space-y-10 relative">
        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-[70%] h-52 rounded-full bg-primary/10 blur-3xl" />

        <section className="relative text-center space-y-4 max-w-5xl mx-auto rounded-3xl border border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background p-6 md:p-10 shadow-[0_18px_44px_rgba(0,0,0,0.10)]">
          <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/30 mx-auto px-3 py-1">
            Agent Network
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Discover Top-Producing Agents
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Compare performance, market coverage, and listing quality in one place. Filter by deals, experience, location,
            and price range to find the right partner.
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-background via-primary/5 to-background border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold mt-1">{headlineStats.totalAgents}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-background via-primary/5 to-background border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Network Volume</p>
              <p className="text-2xl font-bold mt-1">{formatMoney(headlineStats.totalVolume)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-background via-primary/5 to-background border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold mt-1">{headlineStats.avgRating.toFixed(1)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-background via-primary/5 to-background border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold mt-1">{headlineStats.totalActive}</p>
            </CardContent>
          </Card>
        </section>

        <Card className="max-w-5xl mx-auto bg-gradient-to-br from-background via-yellow-500/5 to-background border-yellow-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top Producers
            </CardTitle>
            <CardDescription>Agents with {TOP_PRODUCER_DEALS}+ closed deals.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topProducers.map((agent) => (
              <Link
                key={agent.id}
                href={`/explore/agent/${agent.id}`}
                className="rounded-xl border border-border/60 p-4 hover:border-primary/40 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img src={agent.avatar} alt={agent.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20" />
                  <div>
                    <p className="font-semibold">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.brokerage}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Deals</p>
                    <p className="font-semibold">{agent.stats.sold}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-semibold">{formatMoney(agent.stats.volume)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="max-w-6xl mx-auto px-1 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">All Agents</h2>
            <p className="text-sm text-muted-foreground mt-1">{filteredAgents.length} results</p>
          </div>
          <Card className="bg-background/85 border-primary/20">
            <CardContent className="px-3 py-3 flex items-center justify-end gap-2">
              <Button variant="outline" size="icon" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Filter">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Advanced Filters">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No agents matched your filters.
              <div className="mt-3">
                <Button variant="outline">
                  Reset filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredAgents.map((agent, idx) => {
              const averageDealPrice = getAverageDealPrice(agent.stats.volume, agent.stats.sold);
              const listingsCount = MOCK_LISTINGS.filter((listing) => listing.agentId === agent.id).length;
              const isTopProducer = agent.stats.sold >= TOP_PRODUCER_DEALS;
              const estimatedCloseRate = Math.min(96, 72 + idx * 3 + Math.round(agent.rating));
              const avgDaysOnMarket = Math.max(10, 24 - idx * 2);

              return (
                <Link key={agent.id} href={`/explore/agent/${agent.id}`}>
                  <Card className="h-full overflow-hidden border-primary/20 hover:border-primary/50 hover:shadow-[0_14px_34px_rgba(59,130,246,0.18)] transition-all">
                    <div className="relative h-36">
                      <img
                        src={getAgentListingImage(agent.id)}
                        alt={`${agent.name} featured listing`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute left-4 bottom-3 flex items-center gap-2 text-white">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-xs">{agent.location}</span>
                      </div>
                    </div>

                    <CardHeader className="space-y-4 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="h-16 w-16 rounded-full object-cover -mt-10 ring-4 ring-background shadow-md"
                          />
                          <div>
                            <CardTitle className="text-xl">{agent.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {agent.brokerage}
                            </CardDescription>
                          </div>
                        </div>
                        {isTopProducer && (
                          <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                            <Trophy className="h-3 w-3 mr-1" />
                            Top Producer
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="rounded-lg border bg-background/50 p-2">
                          <p className="text-muted-foreground text-xs">Deals</p>
                          <p className="font-semibold">{agent.stats.sold}</p>
                        </div>
                        <div className="rounded-lg border bg-background/50 p-2">
                          <p className="text-muted-foreground text-xs">Active</p>
                          <p className="font-semibold">{agent.stats.active}</p>
                        </div>
                        <div className="rounded-lg border bg-background/50 p-2">
                          <p className="text-muted-foreground text-xs">Rating</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            {agent.rating.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-lg border bg-background/50 p-2">
                          <p className="text-muted-foreground text-xs">Volume</p>
                          <p className="font-semibold">{formatMoney(agent.stats.volume)}</p>
                        </div>
                        <div className="rounded-lg border bg-background/50 p-2">
                          <p className="text-muted-foreground text-xs">Avg Deal</p>
                          <p className="font-semibold">{formatMoney(averageDealPrice)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-lg border bg-background/50 p-2">
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />
                            Close Rate
                          </p>
                          <p className="font-semibold">{estimatedCloseRate}%</p>
                        </div>
                        <div className="rounded-lg border bg-background/50 p-2">
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5" />
                            Avg DOM
                          </p>
                          <p className="font-semibold">{avgDaysOnMarket} days</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {agent.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="bg-primary/10 border-primary/20">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                        <span className="flex items-center gap-1">
                          <UserRoundCheck className="h-3.5 w-3.5" />
                          {listingsCount} listings
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {agent.experienceYears} yrs exp.
                        </span>
                      </div>

                      <Button variant="outline" className="w-full gap-2">
                        View Agent Profile <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            </div>

          </div>
        )}
      </div>
      <ChatbotFab
        title="Agent Assistant"
        placeholder="Ask for agents by location, budget, specialty, or deal volume"
      />
    </DottedSurface>
  );
}
