"use client";

import Link from "next/link";
import { ListingCard } from "@/components/dashboard/listing-card";
import { IntentCard } from "@/components/dashboard/intent-card";
import { AIOverview } from "@/components/dashboard/ai-overview";
import { MarketFeed } from "@/components/dashboard/market-feed";
import { VendorDirectory } from "@/components/dashboard/vendor-directory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GradientSkewCard } from "@/components/ui/gradient-card-showcase";
import {
    ArrowRight,
    CalendarClock,
    CircleDollarSign,
    Compass,
    Handshake,
    Sparkles,
} from "lucide-react";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import {
    useWorkspaceAiStore,
} from "@/lib/workspace-ai-store";

export type ClientDetailKey =
    | "journey_tracker"
    | "weekly_plan"
    | "deal_room"
    | "new_matches"
    | "search_criteria"
    | "what_if_simulator";

export type IntentType = "buy" | "sell" | "rent_out" | "renting";

export type JourneyStage =
    | "searching"
    | "touring"
    | "listed"
    | "offers"
    | "under_contract"
    | "leased"
    | "active_tenancy"
    | "closed";

export interface ClientJourney {
    id: string;
    clientId: string;
    propertyId: string;
    intentType: IntentType;
    stage: JourneyStage;
    monetaryImpactEstimate: number;
    urgencyScore: number;
    label: string;
    primaryMetrics: Array<{
        label: string;
        value: string;
    }>;
    nextDueDate?: string;
}

export interface ClientDashboardSnapshot {
    clientId: string;
    journeys: ClientJourney[];
    intentsSummary: {
        buyCount: number;
        sellCount: number;
        rentOutCount: number;
        rentingCount: number;
    };
    prioritizedJourneys: ClientJourney[];
    totals: {
        potentialPurchaseVolume: number;
        potentialSaleProceeds: number;
        monthlyRentIn: number;
        monthlyRentOut: number;
    };
}

export type ClientDetailSelection = {
    key: ClientDetailKey;
    title: string;
    summary: string;
    intentType?: IntentType;
    listingId?: string;
};

export const INTENT_LABEL: Record<IntentType, string> = {
    buy: "Buying",
    sell: "Selling",
    rent_out: "Renting Out",
    renting: "Renting",
};

export const STAGE_TONE: Record<JourneyStage, string> = {
    searching: "border-blue-500/30 text-blue-300",
    touring: "border-sky-500/30 text-sky-300",
    listed: "border-amber-500/30 text-amber-300",
    offers: "border-purple-500/30 text-purple-300",
    under_contract: "border-indigo-500/30 text-indigo-300",
    leased: "border-green-500/30 text-green-300",
    active_tenancy: "border-emerald-500/30 text-emerald-300",
    closed: "border-zinc-500/30 text-zinc-300",
};

export const formatCompactCurrency = (value: number) => {
    if (value >= 1000000000) {
        return "$" + (value / 1000000000).toFixed(1) + "B";
    }
    if (value >= 1000000) {
        return "$" + (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
        return "$" + (value / 1000).toFixed(1) + "K";
    }
    return "$" + value.toFixed(0);
};

export function OverviewSection({
    snapshot,
    onOpenAI,
    onExploreDetail,
}: {
    snapshot: ClientDashboardSnapshot;
    onOpenAI: (context?: { intentType?: IntentType; listingId?: string }) => void;
    onExploreDetail: (detail: ClientDetailSelection) => void;
}) {
    const { prioritizedJourneys, intentsSummary, totals } = snapshot;
    const primaryJourney = prioritizedJourneys[0];
    const activeJourneyCount = prioritizedJourneys.length;
    const activeIntentCount = [
        intentsSummary.buyCount,
        intentsSummary.sellCount,
        intentsSummary.rentOutCount,
        intentsSummary.rentingCount,
    ].filter((count) => count > 0).length;
    const intentBreakdown = `${intentsSummary.buyCount} buy • ${intentsSummary.sellCount} sell • ${intentsSummary.rentOutCount} rent_out • ${intentsSummary.rentingCount} renting`;

    const quickStats = [
        {
            label: "Open Journeys",
            value: String(activeJourneyCount),
            helper: `${activeIntentCount} active intent lanes`,
            icon: Handshake,
            detailKey: "journey_tracker" as const,
        },
        {
            label: "Intent Mix",
            value: intentBreakdown,
            helper: "Portfolio-level intent coverage",
            icon: Compass,
            detailKey: "search_criteria" as const,
        },
        {
            label: "High Priority",
            value: String(prioritizedJourneys.filter((j) => j.urgencyScore >= 70).length),
            helper: "Urgency score >= 70",
            icon: CalendarClock,
            detailKey: "weekly_plan" as const,
        },
        {
            label: "Financial Surface",
            value: formatCompactCurrency(totals.potentialPurchaseVolume + totals.potentialSaleProceeds),
            helper: "Buy + sell capital exposure",
            icon: CircleDollarSign,
            detailKey: "what_if_simulator" as const,
        },
    ] as const;

    const actionQueue = prioritizedJourneys.slice(0, 3).map((journey) => ({
        title: `${INTENT_LABEL[journey.intentType]}: ${journey.label}`,
        reason: `Stage "${journey.stage}" has urgency ${journey.urgencyScore}. Focus this lane next.`,
        confidence: journey.urgencyScore >= 80 ? "High" : journey.urgencyScore >= 60 ? "Medium" : "Low",
        due: journey.nextDueDate ? new Date(journey.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Review now",
        journey,
    }));

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickStats.map((stat) => (
                    <GradientSkewCard
                        key={stat.label}
                        title={stat.label}
                        description={stat.helper}
                        gradientFrom="#ffbc00"
                        gradientTo="#ff0058"
                        className="h-full min-h-[200px] cursor-pointer"
                    >
                        <button
                            type="button"
                            className="absolute inset-0 z-30"
                            onClick={() =>
                                onExploreDetail({
                                    key: stat.detailKey,
                                    title: stat.label,
                                    summary: stat.helper,
                                    intentType: primaryJourney?.intentType,
                                    listingId: primaryJourney?.propertyId,
                                })
                            }
                            aria-label={`Open ${stat.label}`}
                        />
                        <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wide text-white/80">
                            <span>Snapshot</span>
                            <stat.icon className="h-4 w-4 text-white/80" />
                        </div>
                        <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    </GradientSkewCard>
                ))}
            </div>

            <AIOverview
                onReviewMatches={() =>
                    onExploreDetail({
                        key: "new_matches",
                        title: `Review Priority Matches${primaryJourney ? ` (${INTENT_LABEL[primaryJourney.intentType]})` : ""}`,
                        summary: "Inspect top matched homes and decide next actions.",
                        intentType: primaryJourney?.intentType,
                        listingId: primaryJourney?.propertyId,
                    })
                }
                onUpdateSearchCriteria={() =>
                    onExploreDetail({
                        key: "search_criteria",
                        title: "Update Search Criteria",
                        summary: "Refine filters by active intent lanes and urgency.",
                        intentType: primaryJourney?.intentType,
                        listingId: primaryJourney?.propertyId,
                    })
                }
            />

            <div className="grid gap-6 lg:grid-cols-5">
                <GradientSkewCard
                    title="Multi-Intent Journey Tracker"
                    description="One card per active journey, ranked by urgency and monetary impact."
                    gradientFrom="#03a9f4"
                    gradientTo="#ff0058"
                    showGradient={false}
                    className="lg:col-span-3 min-h-[420px]"
                >
                    <div className="relative z-30 mt-4 space-y-3">
                        {prioritizedJourneys.slice(0, 5).map((journey, index) => (
                            <div
                                key={journey.id}
                                className="rounded-lg border border-white/15 bg-black/25 p-3 cursor-pointer hover:border-primary/30 transition-colors"
                                onClick={() =>
                                    onExploreDetail({
                                        key: "journey_tracker",
                                        title: journey.label,
                                        summary: `${INTENT_LABEL[journey.intentType]} lane in "${journey.stage}" stage.`,
                                        intentType: journey.intentType,
                                        listingId: journey.propertyId,
                                    })
                                }
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold bg-white/10 text-muted-foreground"
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{journey.label}</p>
                                            <p className="text-sm text-muted-foreground">{INTENT_LABEL[journey.intentType]} • {journey.stage}</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {journey.primaryMetrics.slice(0, 3).map((metric) => (
                                                    <Badge key={`${journey.id}-${metric.label}`} variant="outline" className="border-white/20 text-xs">
                                                        {metric.label}: {metric.value}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={STAGE_TONE[journey.stage]}>
                                        {journey.stage}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </GradientSkewCard>

                <GradientSkewCard
                    title="Priority Action Center"
                    description="Recommendations generated from the highest-priority journeys."
                    gradientFrom="#4dff03"
                    gradientTo="#00d0ff"
                    showGradient={false}
                    className="lg:col-span-2 min-h-[420px]"
                >
                    <div className="relative z-30 mt-4 space-y-3">
                        {actionQueue.map((task) => (
                            <div key={task.title} className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium text-sm">{task.title}</p>
                                    <Badge variant="outline" className="border-white/20 text-xs">
                                        {task.confidence}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{task.reason}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-blue-200/90">Due: {task.due}</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs bg-transparent border-blue-300/30 hover:bg-blue-500/20"
                                        onClick={() =>
                                            onExploreDetail({
                                                key: "weekly_plan",
                                                title: task.title,
                                                summary: task.reason,
                                                intentType: task.journey.intentType,
                                                listingId: task.journey.propertyId,
                                            })
                                        }
                                    >
                                        Start
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            onClick={() => {
                                onOpenAI({
                                    intentType: primaryJourney?.intentType,
                                    listingId: primaryJourney?.propertyId,
                                });
                                onExploreDetail({
                                    key: "weekly_plan",
                                    title: "Build Weekly Plan",
                                    summary: "Generate and review this week’s workflow checklist by intent.",
                                    intentType: primaryJourney?.intentType,
                                    listingId: primaryJourney?.propertyId,
                                });
                            }}
                            className="w-full gap-2"
                        >
                            <Sparkles className="h-4 w-4" /> Build Weekly Plan
                        </Button>
                    </div>
                </GradientSkewCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <GradientSkewCard
                    title="Deal Room Snapshot"
                    description="Cross-intent deadlines, documents, and negotiation updates."
                    gradientFrom="#ffbc00"
                    gradientTo="#ff0058"
                    showGradient={false}
                    className="min-h-[420px]"
                >
                    <div className="relative z-30 mt-4 space-y-3">
                        {prioritizedJourneys.slice(0, 3).map((journey, index) => (
                            <div key={journey.id} className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${index === 0 ? "border-amber-500/20 bg-amber-500/10" : "border-white/10"}`}>
                                <div>
                                    <p className="font-medium">{journey.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {INTENT_LABEL[journey.intentType]} lane • {journey.stage} • Urgency {journey.urgencyScore}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7"
                                    onClick={() =>
                                        onExploreDetail({
                                            key: "deal_room",
                                            title: journey.label,
                                            summary: "Review documents, deadlines, and collaboration history for this journey.",
                                            intentType: journey.intentType,
                                            listingId: journey.propertyId,
                                        })
                                    }
                                >
                                    Open
                                </Button>
                            </div>
                        ))}
                    </div>
                </GradientSkewCard>

                <GradientSkewCard
                    title="Financial Clarity"
                    description="Intent-aware budget, sale, and rental exposure in one view."
                    gradientFrom="#4dff03"
                    gradientTo="#00d0ff"
                    showGradient={false}
                    className="min-h-[420px]"
                >
                    <div className="relative z-30 mt-4 space-y-4">
                        <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                            <p className="text-sm text-muted-foreground">Potential Purchase Volume</p>
                            <p className="mt-1 text-3xl font-bold">{formatCompactCurrency(totals.potentialPurchaseVolume)}</p>
                            <p className="mt-1 text-xs text-green-400">Primary lane: {primaryJourney ? INTENT_LABEL[primaryJourney.intentType] : "N/A"}.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-white/10 p-3">
                                <p className="text-xs text-muted-foreground">Potential Sale Proceeds</p>
                                <p className="mt-1 font-semibold">{formatCompactCurrency(totals.potentialSaleProceeds)}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 p-3">
                                <p className="text-xs text-muted-foreground">Net Monthly Rent</p>
                                <p className="mt-1 font-semibold">{formatCompactCurrency(totals.monthlyRentIn - totals.monthlyRentOut)}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() =>
                                onExploreDetail({
                                    key: "what_if_simulator",
                                    title: "What-If Simulator",
                                    summary: "Model scenarios for buy, sell, rent_out, and renting lanes.",
                                    intentType: primaryJourney?.intentType,
                                    listingId: primaryJourney?.propertyId,
                                })
                            }
                        >
                            <CircleDollarSign className="h-4 w-4" /> Run What-If Simulator
                        </Button>
                    </div>
                </GradientSkewCard>
            </div>
        </div>
    );
}

export function ListingsSection() {
    const { listings: aiListings } = useWorkspaceAiStore();

    const listingA = MOCK_LISTINGS[0];
    const listingB = MOCK_LISTINGS[1] ?? MOCK_LISTINGS[0];
    const listingC = MOCK_LISTINGS[2] ?? MOCK_LISTINGS[0];

    const mergedListings = [
        ...aiListings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            location: listing.location,
            price: listing.price,
            status: listing.status,
            views: 0,
            offers: 0,
            agentName: "AI Workspace",
            agentImage: "",
            href: "/explore/agent/listing/prop-1",
        })),
        {
            id: listingA.id,
            title: listingA.title,
            location: listingA.location,
            price: `$${listingA.price.toLocaleString()}`,
            status: listingA.status as "Active" | "Pending" | "Sold",
            views: 1240,
            offers: listingA.offers,
            agentName: "Sarah Connor",
            agentImage: "",
            href: `/explore/agent/listing/${listingA.id}`,
        },
        {
            id: listingB.id,
            title: listingB.title,
            location: listingB.location,
            price: `$${listingB.price.toLocaleString()}`,
            status: listingB.status as "Active" | "Pending" | "Sold",
            views: 3500,
            offers: listingB.offers,
            agentName: "John Smith",
            agentImage: "",
            href: `/explore/agent/listing/${listingB.id}`,
        },
        {
            id: listingC.id,
            title: listingC.title,
            location: listingC.location,
            price: `$${listingC.price.toLocaleString()}`,
            status: listingC.status as "Active" | "Pending" | "Sold",
            views: 1680,
            offers: listingC.offers,
            agentName: "Elena Rodriguez",
            agentImage: "",
            href: `/explore/agent/listing/${listingC.id}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mergedListings.map((listing) => (
                <ListingCard
                    key={listing.id}
                    title={listing.title}
                    location={listing.location}
                    price={listing.price}
                    status={listing.status}
                    views={listing.views}
                    offers={listing.offers}
                    agentName={listing.agentName}
                    agentImage={listing.agentImage}
                    href={listing.href}
                />
            ))}
        </div>
    );
}

export function PlansSection() {
    const { buyingPlans: aiPlans } = useWorkspaceAiStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {aiPlans.map((plan) => (
                <IntentCard
                    key={plan.id}
                    title={plan.title}
                    location={plan.location}
                    budget={plan.budget}
                    matchScore={plan.matchScore}
                    status={plan.status}
                    agentName="AI Workspace"
                    listingHref="/explore/agent/listing/prop-1"
                />
            ))}
            <IntentCard
                title="Waterfront Condo"
                location="Miami, FL"
                budget="$800k - $1.2M"
                matchScore={94}
                status="Searching"
                agentName="Mike Ross"
                matchesHref="/dashboard/plans/waterfront-condo"
                listingHref="/explore/agent/listing/prop-5"
            />
            <IntentCard
                title="Suburban Family Home"
                location="Austin, TX"
                budget="$600k - $750k"
                matchScore={88}
                status="Negotiating"
                agentName="Jessica Pearson"
                matchesHref="/dashboard/plans/suburban-family-home"
                listingHref="/explore/agent/listing/prop-4"
            />
            <IntentCard
                title="Move-In Ready Townhome"
                location="Seattle, WA"
                budget="$700k - $900k"
                matchScore={81}
                status="Searching"
                agentName="Sarah Jenkins"
                matchesHref="/dashboard/plans/move-in-ready-townhome"
                listingHref="/explore/agent/listing/prop-6"
            />
        </div>
    );
}

export function MarketSection() {
    return <MarketFeed />;
}

export function NetworkSection() {
    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 space-y-2">
                        <p className="font-semibold">Top Buyer Agents</p>
                        <p className="text-sm text-muted-foreground">Ranked by your budget, market, and timeline fit.</p>
                        <Button asChild variant="outline" size="sm" className="gap-1">
                            <Link href="/explore/agent">Explore <ArrowRight className="h-3 w-3" /></Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 space-y-2">
                        <p className="font-semibold">Vendor Marketplace</p>
                        <p className="text-sm text-muted-foreground">Inspectors, lenders, attorneys, movers, and more.</p>
                        <Button asChild variant="outline" size="sm" className="gap-1">
                            <Link href="/explore/vendor">Explore <ArrowRight className="h-3 w-3" /></Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 space-y-2">
                        <p className="font-semibold">Unified Discovery</p>
                        <p className="text-sm text-muted-foreground">Move between client, agent, broker, and vendor workspaces.</p>
                        <Button asChild variant="outline" size="sm" className="gap-1">
                            <Link href="/explore">Open Role Hub <ArrowRight className="h-3 w-3" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <VendorDirectory />
        </div>
    );
}
