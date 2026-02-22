"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BedDouble, Bath, Sparkles, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MatchMedia = {
    image: string;
    video?: string;
};

type MatchListing = {
    id: string;
    listingHref: string;
    title: string;
    location: string;
    price: string;
    beds: number;
    baths: number;
    sqft: number;
    score: number;
    reason: string;
    media: MatchMedia;
};

type PlanMatches = {
    title: string;
    intentSummary: string;
    matches: MatchListing[];
};

const PLAN_MATCHES: Record<string, PlanMatches> = {
    "waterfront-condo": {
        title: "Waterfront Condo",
        intentSummary: "Buying intent: Miami condo, $800k - $1.2M, 2+ beds, water view preferred.",
        matches: [
            {
                id: "miami-1",
                listingHref: "/explore/agent/listing/prop-5",
                title: "Brickell Bay Residences 22A",
                location: "Brickell, Miami, FL",
                price: "$1,080,000",
                beds: 2,
                baths: 2,
                sqft: 1540,
                score: 95,
                reason: "Matches budget, waterfront preference, and modern high-rise style with balcony views.",
                media: {
                    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&fit=crop",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                },
            },
            {
                id: "miami-2",
                listingHref: "/explore/agent/listing/prop-7",
                title: "Edgewater Horizon Suite",
                location: "Edgewater, Miami, FL",
                price: "$975,000",
                beds: 2,
                baths: 2,
                sqft: 1420,
                score: 91,
                reason: "Strong price fit and neighborhood match; includes floor-to-ceiling water-facing windows.",
                media: {
                    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&fit=crop",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                },
            },
            {
                id: "miami-3",
                listingHref: "/explore/agent/listing/prop-12",
                title: "South Beach Marina Tower",
                location: "South Beach, Miami, FL",
                price: "$1,190,000",
                beds: 3,
                baths: 2,
                sqft: 1685,
                score: 88,
                reason: "Within upper budget range and exceeds bedroom target while staying near waterfront.",
                media: {
                    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&fit=crop",
                },
            },
        ],
    },
    "suburban-family-home": {
        title: "Suburban Family Home",
        intentSummary: "Buying intent: Austin suburbs, $600k - $750k, 4 beds, family-friendly layout.",
        matches: [
            {
                id: "aus-1",
                listingHref: "/explore/agent/listing/prop-4",
                title: "Lakeway Family Retreat",
                location: "Lakeway, Austin, TX",
                price: "$725,000",
                beds: 4,
                baths: 3,
                sqft: 3050,
                score: 92,
                reason: "Matches bedroom requirement and budget with high-rated school district alignment.",
                media: {
                    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&fit=crop",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                },
            },
            {
                id: "aus-2",
                listingHref: "/explore/agent/listing/prop-11",
                title: "Round Rock Corner Lot",
                location: "Round Rock, TX",
                price: "$689,000",
                beds: 4,
                baths: 3,
                sqft: 2870,
                score: 89,
                reason: "Price and size fit your family profile with low commute times to key work anchors.",
                media: {
                    image: "https://images.unsplash.com/photo-1600596542815-2a4d9f6facbe?q=80&w=1600&fit=crop",
                },
            },
        ],
    },
    "move-in-ready-townhome": {
        title: "Move-In Ready Townhome",
        intentSummary: "Buying intent: Seattle townhome, $700k - $900k, low renovation risk, close to transit.",
        matches: [
            {
                id: "sea-1",
                listingHref: "/explore/agent/listing/prop-6",
                title: "Capitol Hill Turnkey Townhome",
                location: "Capitol Hill, Seattle, WA",
                price: "$865,000",
                beds: 3,
                baths: 3,
                sqft: 1980,
                score: 90,
                reason: "Move-in condition and transit proximity match your timeline and commute intent.",
                media: {
                    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1600&fit=crop",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                },
            },
            {
                id: "sea-2",
                listingHref: "/explore/agent/listing/prop-3",
                title: "Ballard Smart Townhouse",
                location: "Ballard, Seattle, WA",
                price: "$812,000",
                beds: 3,
                baths: 2,
                sqft: 1760,
                score: 86,
                reason: "Within budget with recent upgrades and minimal deferred maintenance risk.",
                media: {
                    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&fit=crop",
                },
            },
        ],
    },
};

type ViewMode = "cards" | "reels";

export default function PlanMatchesPage() {
    const { planId } = useParams<{ planId: string }>();
    const [mode, setMode] = useState<ViewMode>("cards");

    const plan = useMemo(() => PLAN_MATCHES[planId], [planId]);

    if (!plan) {
        return (
            <div className="space-y-4">
                <Button asChild variant="ghost" className="pl-0">
                    <Link href="/dashboard/plans">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Buying Plans
                    </Link>
                </Button>
                <Card className="bg-card/70 border-border">
                    <CardContent className="py-10 text-center">
                        <p className="text-lg font-semibold">Plan not found</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Select a plan and click View Matches again.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <Button asChild variant="ghost" className="pl-0">
                        <Link href="/dashboard/plans">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Buying Plans
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">{plan.title} Matches</h1>
                    <p className="text-sm text-muted-foreground mt-1">{plan.intentSummary}</p>
                </div>

                <div className="inline-flex rounded-lg border border-border overflow-hidden">
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm ${mode === "cards" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
                        onClick={() => setMode("cards")}
                    >
                        Cards
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm ${mode === "reels" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
                        onClick={() => setMode("reels")}
                    >
                        Reels
                    </button>
                </div>
            </div>

            {mode === "cards" ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {plan.matches.map((listing) => (
                        <Link key={listing.id} href={listing.listingHref} className="block">
                        <Card className="overflow-hidden border-border/80 bg-card/80 hover:border-primary/40 transition-colors">
                            <img src={listing.media.image} alt={listing.title} className="h-52 w-full object-cover" />
                            <CardHeader className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                                    <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                                        {listing.score}% match
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{listing.location}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-xl font-semibold">{listing.price}</div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        <BedDouble className="h-4 w-4" />
                                        {listing.beds}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Bath className="h-4 w-4" />
                                        {listing.baths}
                                    </span>
                                    <span>{listing.sqft.toLocaleString()} sqft</span>
                                </div>
                                <p className="text-sm text-foreground/90 inline-flex gap-2">
                                    <Sparkles className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                                    {listing.reason}
                                </p>
                            </CardContent>
                        </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="h-[74vh] overflow-y-auto snap-y snap-mandatory space-y-4 pr-1">
                    {plan.matches.map((listing) => (
                        <Card
                            key={listing.id}
                            className="relative h-[70vh] snap-start overflow-hidden border-border/80 bg-black"
                        >
                            {listing.media.video ? (
                                <video
                                    src={listing.media.video}
                                    poster={listing.media.image}
                                    className="h-full w-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img src={listing.media.image} alt={listing.title} className="h-full w-full object-cover" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/20" />

                            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-xl font-semibold text-white">{listing.title}</h3>
                                    <Badge className="bg-white/10 text-white border-white/30">
                                        {listing.score}% match
                                    </Badge>
                                </div>
                                <p className="text-sm text-white/80">{listing.location}</p>
                                <p className="text-lg font-semibold text-white">{listing.price}</p>
                                <p className="text-sm text-white/90 inline-flex gap-2">
                                    <PlayCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    {listing.reason}
                                </p>
                                <div className="pt-2">
                                    <Button asChild size="sm" variant="secondary" className="bg-white/15 text-white hover:bg-white/25 border border-white/30">
                                        <Link href={listing.listingHref}>View Details</Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
