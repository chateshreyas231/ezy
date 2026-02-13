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

export type ClientDetailKey =
    | "journey_tracker"
    | "weekly_plan"
    | "deal_room"
    | "new_matches"
    | "search_criteria"
    | "what_if_simulator";

export type ClientDetailSelection = {
    key: ClientDetailKey;
    title: string;
    summary: string;
};

const journeySteps = [
    { label: "Pre-Approval", status: "done", detail: "Letter verified" },
    { label: "Search", status: "active", detail: "14 matches this week" },
    { label: "Tour", status: "upcoming", detail: "2 pending requests" },
    { label: "Offer", status: "upcoming", detail: "Offer strategy prepared" },
    { label: "Closing", status: "upcoming", detail: "Timeline estimate: 31 days" }
] as const;

const actionQueue = [
    {
        title: "Upload latest pre-approval letter",
        reason: "3 shortlisted homes require proof of funds before scheduling tours.",
        confidence: "High",
        due: "Today"
    },
    {
        title: "Review counter-offer summary",
        reason: "Seller moved 2.1% on price and requested a 14-day inspection window.",
        confidence: "Medium",
        due: "In 20 hours"
    },
    {
        title: "Book inspection vendor",
        reason: "The accepted offer in Austin needs inspection booked before Monday.",
        confidence: "High",
        due: "By Monday"
    }
] as const;

const quickStats = [
    { label: "Open Deals", value: "2", helper: "1 buy-side, 1 sell-side", icon: Handshake, detailKey: "deal_room" as const },
    { label: "New Matches", value: "14", helper: "Past 7 days", icon: Compass, detailKey: "new_matches" as const },
    { label: "Deadline Alerts", value: "3", helper: "Needs attention", icon: CalendarClock, detailKey: "journey_tracker" as const },
    { label: "Budget Health", value: "On Track", helper: "Within target range", icon: CircleDollarSign, detailKey: "what_if_simulator" as const }
] as const;

export function OverviewSection({
    onOpenAI,
    onExploreDetail,
}: {
    onOpenAI: () => void;
    onExploreDetail: (detail: ClientDetailSelection) => void;
}) {
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
                        title: "Review 3 New Matches",
                        summary: "Inspect top matched homes and decide next actions.",
                    })
                }
                onUpdateSearchCriteria={() =>
                    onExploreDetail({
                        key: "search_criteria",
                        title: "Update Search Criteria",
                        summary: "Refine budget, location, and must-have filters.",
                    })
                }
            />

            <div className="grid gap-6 lg:grid-cols-5">
                <GradientSkewCard
                    title="Journey Tracker"
                    description="Track where you are in the transaction process and what is blocked."
                    gradientFrom="#03a9f4"
                    gradientTo="#ff0058"
                    showGradient={false}
                    className="lg:col-span-3 min-h-[420px]"
                >
                    <div className="relative z-30 mt-4 space-y-3">
                        {journeySteps.map((step, index) => (
                            <div
                                key={step.label}
                                className="rounded-lg border border-white/15 bg-black/25 p-3 cursor-pointer hover:border-primary/30 transition-colors"
                                onClick={() =>
                                    onExploreDetail({
                                        key: "journey_tracker",
                                        title: `Journey Step: ${step.label}`,
                                        summary: step.detail,
                                    })
                                }
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${step.status === "done"
                                                    ? "bg-green-500/20 text-green-300"
                                                    : step.status === "active"
                                                        ? "bg-blue-500/20 text-blue-300"
                                                        : "bg-white/10 text-muted-foreground"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{step.label}</p>
                                            <p className="text-sm text-muted-foreground">{step.detail}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            step.status === "done"
                                                ? "border-green-500/30 text-green-300"
                                                : step.status === "active"
                                                    ? "border-blue-500/30 text-blue-300"
                                                    : "border-white/20 text-muted-foreground"
                                        }
                                    >
                                        {step.status === "done" ? "Complete" : step.status === "active" ? "In Progress" : "Upcoming"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </GradientSkewCard>

                <GradientSkewCard
                    title="Priority Action Center"
                    description="Recommendations ranked by urgency and confidence."
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
                                onOpenAI();
                                onExploreDetail({
                                    key: "weekly_plan",
                                    title: "Build Weekly Plan",
                                    summary: "Generate and review this week’s transaction checklist.",
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
                    description="Deadlines, paperwork, and negotiation updates from your active deals."
                    gradientFrom="#ffbc00"
                    gradientTo="#ff0058"
                    showGradient={false}
                    className="min-h-[420px]"
                >
                    <div className="relative z-30 mt-4 space-y-3">
                        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                            <div>
                                <p className="font-medium">Earnest money confirmation pending</p>
                                <p className="text-sm text-muted-foreground">Austin offer accepted on 82 Pine Street.</p>
                            </div>
                            <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/20">Urgent</Badge>
                        </div>
                        <div className="flex items-start justify-between gap-3 rounded-lg border border-white/10 p-3">
                            <div>
                                <p className="font-medium">Seller disclosure reviewed</p>
                                <p className="text-sm text-muted-foreground">2 clauses flagged to verify with attorney.</p>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7"
                                onClick={() =>
                                    onExploreDetail({
                                        key: "deal_room",
                                        title: "Seller Disclosure Review",
                                        summary: "Two contract clauses require legal confirmation.",
                                    })
                                }
                            >
                                Open
                            </Button>
                        </div>
                        <div className="flex items-start justify-between gap-3 rounded-lg border border-white/10 p-3">
                            <div>
                                <p className="font-medium">Tour confirmed for Sunday 11:30 AM</p>
                                <p className="text-sm text-muted-foreground">Listed by Sarah Jenkins in Beverly Hills.</p>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7"
                                onClick={() =>
                                    onExploreDetail({
                                        key: "deal_room",
                                        title: "Tour Appointment Details",
                                        summary: "Review attendee list, notes, and confirmation timeline.",
                                    })
                                }
                            >
                                Details
                            </Button>
                        </div>
                    </div>
                </GradientSkewCard>

                <GradientSkewCard
                    title="Financial Clarity"
                    description="Understand payment impact, closing costs, and market movement."
                    gradientFrom="#4dff03"
                    gradientTo="#00d0ff"
                    showGradient={false}
                    className="min-h-[420px]"
                >
                    <div className="relative z-30 mt-4 space-y-4">
                        <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                            <p className="text-sm text-muted-foreground">Estimated monthly payment</p>
                            <p className="mt-1 text-3xl font-bold">$4,860</p>
                            <p className="mt-1 text-xs text-green-400">If rates drop 0.5%, payment could be around $4,590.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-white/10 p-3">
                                <p className="text-xs text-muted-foreground">Closing Cost Range</p>
                                <p className="mt-1 font-semibold">$21k - $29k</p>
                            </div>
                            <div className="rounded-lg border border-white/10 p-3">
                                <p className="text-xs text-muted-foreground">Offer Confidence</p>
                                <p className="mt-1 font-semibold">74%</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() =>
                                onExploreDetail({
                                    key: "what_if_simulator",
                                    title: "What-If Simulator",
                                    summary: "Model how rate, down payment, and offer price affect monthly cost.",
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
    const listingA = MOCK_LISTINGS[0];
    const listingB = MOCK_LISTINGS[1] ?? MOCK_LISTINGS[0];
    const listingC = MOCK_LISTINGS[2] ?? MOCK_LISTINGS[0];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ListingCard
                title={listingA.title}
                location={listingA.location}
                price={`$${listingA.price.toLocaleString()}`}
                status={listingA.status as "Active" | "Pending" | "Sold"}
                views={1240}
                offers={listingA.offers}
                agentName="Sarah Connor"
                agentImage=""
                href={`/explore/agent/listing/${listingA.id}`}
            />
            <ListingCard
                title={listingB.title}
                location={listingB.location}
                price={`$${listingB.price.toLocaleString()}`}
                status={listingB.status as "Active" | "Pending" | "Sold"}
                views={3500}
                offers={listingB.offers}
                agentName="John Smith"
                agentImage=""
                href={`/explore/agent/listing/${listingB.id}`}
            />
            <ListingCard
                title={listingC.title}
                location={listingC.location}
                price={`$${listingC.price.toLocaleString()}`}
                status={listingC.status as "Active" | "Pending" | "Sold"}
                views={1680}
                offers={listingC.offers}
                agentName="Elena Rodriguez"
                agentImage=""
                href={`/explore/agent/listing/${listingC.id}`}
            />
        </div>
    );
}

export function PlansSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <IntentCard
                title="Waterfront Condo"
                location="Miami, FL"
                budget="$800k - $1.2M"
                matchScore={94}
                status="Searching"
                agentName="Mike Ross"
            />
            <IntentCard
                title="Suburban Family Home"
                location="Austin, TX"
                budget="$600k - $750k"
                matchScore={88}
                status="Negotiating"
                agentName="Jessica Pearson"
            />
            <IntentCard
                title="Move-In Ready Townhome"
                location="Seattle, WA"
                budget="$700k - $900k"
                matchScore={81}
                status="Searching"
                agentName="Sarah Jenkins"
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
