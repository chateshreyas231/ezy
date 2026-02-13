"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { Input } from "@/components/ui/input";
import { MOCK_AGENTS, MOCK_BROKERS } from "@/lib/mock-data";
import { Building2, Search, Star, TrendingUp, Trophy, Users } from "lucide-react";

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

export default function BrokerDirectoryPage() {
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");

  const serviceAreas = useMemo(
    () => Array.from(new Set(MOCK_BROKERS.flatMap((broker) => broker.serviceAreas))).sort(),
    [],
  );

  const filteredBrokers = useMemo(() => {
    return MOCK_BROKERS.filter((broker) => {
      const haystack = `${broker.name} ${broker.tagline} ${broker.specializations.join(" ")}`.toLowerCase();
      const queryMatch = haystack.includes(query.toLowerCase().trim());
      const areaMatch = areaFilter === "all" || broker.serviceAreas.includes(areaFilter);
      return queryMatch && areaMatch;
    }).sort((a, b) => b.stats.totalVolume - a.stats.totalVolume);
  }, [query, areaFilter]);

  const networkStats = useMemo(() => {
    const totalVolume = MOCK_BROKERS.reduce((sum, broker) => sum + broker.stats.totalVolume, 0);
    const totalSold = MOCK_BROKERS.reduce((sum, broker) => sum + broker.stats.totalSold, 0);
    const totalAgents = MOCK_BROKERS.reduce((sum, broker) => sum + broker.agents.length, 0);
    const avgRating = MOCK_BROKERS.reduce((sum, broker) => sum + broker.stats.averageRating, 0) / MOCK_BROKERS.length;

    return { totalVolume, totalSold, totalAgents, avgRating };
  }, []);

  return (
    <DottedSurface className="min-h-screen pt-24 pb-16 px-4 md:px-8 xl:px-10">
      <div className="max-w-[1260px] mx-auto space-y-8">
        <section className="max-w-5xl mx-auto text-center space-y-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-background via-orange-500/5 to-background p-6 md:p-10">
          <Badge variant="secondary" className="mx-auto bg-orange-500/10 text-orange-600 border-orange-500/30">
            Broker Directory
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Brokerage Leadership and Performance
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Compare brokerages by ownership strength, agent performance, market share, and transaction volume. Open any
            broker profile for in-depth roster, reviews, and growth targets.
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          <MetricCard title="Brokerages" value={`${MOCK_BROKERS.length}`} icon={<Building2 className="h-4 w-4" />} />
          <MetricCard title="Total Volume" value={formatMoney(networkStats.totalVolume)} icon={<TrendingUp className="h-4 w-4" />} />
          <MetricCard title="Closed Deals" value={`${networkStats.totalSold}`} icon={<Trophy className="h-4 w-4" />} />
          <MetricCard title="Avg Rating" value={networkStats.avgRating.toFixed(1)} icon={<Star className="h-4 w-4" />} />
        </section>

        <Card className="max-w-5xl mx-auto border-primary/20">
          <CardContent className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs"
                placeholder="Search broker name, specialty, or tagline"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="h-8 rounded-md border border-input bg-transparent px-2.5 text-xs"
              value={areaFilter}
              onChange={(event) => setAreaFilter(event.target.value)}
            >
              <option value="all">All Service Areas</option>
              {serviceAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <div className="max-w-6xl mx-auto flex items-center justify-between px-1">
          <h2 className="text-2xl font-semibold">Brokerages</h2>
          <p className="text-sm text-muted-foreground">{filteredBrokers.length} results</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBrokers.map((broker) => {
            const roster = broker.agents
              .map((agentId) => MOCK_AGENTS.find((agent) => agent.id === agentId))
              .filter(Boolean);

            return (
              <Link key={broker.id} href={`/explore/broker/${broker.id}`}>
                <Card className="h-full overflow-hidden border-primary/20 hover:border-primary/50 hover:shadow-[0_14px_34px_rgba(249,115,22,0.18)] transition-all">
                  <div className="relative h-36">
                    <img src={broker.logo} alt={broker.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute left-4 bottom-3 text-white text-xs flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {broker.agents.length} agents
                    </div>
                  </div>

                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl">{broker.name}</CardTitle>
                    <CardDescription>{broker.tagline}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <MiniStat label="Volume" value={formatMoney(broker.stats.totalVolume)} />
                      <MiniStat label="Deals" value={`${broker.stats.totalSold}`} />
                      <MiniStat label="Market Share" value={`${broker.stats.marketShare.toFixed(1)}%`} />
                      <MiniStat label="Growth" value={`+${broker.stats.yearlyGrowth.toFixed(1)}%`} />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Top Agents</p>
                      <div className="space-y-1">
                        {roster.slice(0, 3).map((agent, idx) => (
                          <div key={agent!.id} className="flex items-center justify-between text-sm">
                            <span className="truncate">#{idx + 1} {agent!.name}</span>
                            <span className="text-muted-foreground">{agent!.stats.sold} deals</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {broker.specializations.slice(0, 3).map((specialization) => (
                        <Badge key={specialization} variant="secondary" className="bg-orange-500/10 border-orange-500/20">
                          {specialization}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

      </div>
      <ChatbotFab
        title="Broker Assistant"
        placeholder="Ask for brokerages by owner, rank, growth, or service area"
      />
    </DottedSurface>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{title}</p>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/60 p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
