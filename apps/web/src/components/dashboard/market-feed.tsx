"use client";

import { useState } from "react";
import { ListingCard } from "./listing-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Warehouse, BedDouble, Bath, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const SAMPLE_LISTINGS = [
    {
        id: "prop-1",
        title: "Modern Glass Villa",
        location: "Beverly Hills, CA",
        price: "$2,500,000",
        status: "Active" as const,
        views: 1240,
        agentName: "Sarah Connor",
        agentImage: "",
        beds: 4,
        baths: 3.5,
        sqft: 3200,
        image: "https://images.unsplash.com/photo-1600596542815-2a4d9f6facbe?q=80&w=1600&fit=crop",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        reason: "Luxury fit with strong demand momentum and high similarity to your saved preferences.",
    },
    {
        id: "prop-2",
        title: "Downtown Penthouse",
        location: "New York, NY",
        price: "$4,200,000",
        status: "Active" as const,
        views: 3500,
        agentName: "John Smith",
        agentImage: "",
        beds: 3,
        baths: 3,
        sqft: 2800,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&fit=crop",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        reason: "High-rise location and premium finishes align with your urban premium listing intent.",
    },
    {
        id: "prop-5",
        title: "Seaside Retreat",
        location: "Malibu, CA",
        price: "$5,800,000",
        status: "Active" as const,
        views: 890,
        agentName: "Jessica Pearson",
        agentImage: "",
        beds: 5,
        baths: 4.5,
        sqft: 4100,
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&fit=crop",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        reason: "Coastal location and larger floor plan match your high-value waterfront criteria.",
    },
    {
        id: "prop-3",
        title: "Urban Loft",
        location: "San Francisco, CA",
        price: "$1,800,000",
        status: "Active" as const,
        views: 2100,
        agentName: "Mike Ross",
        agentImage: "",
        beds: 2,
        baths: 2,
        sqft: 1500,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&fit=crop",
        reason: "Strong city-core fit with efficient space and transit-linked neighborhood score.",
    },
    {
        id: "prop-8",
        title: "Mountain Cabin",
        location: "Aspen, CO",
        price: "$3,400,000",
        status: "Active" as const,
        views: 1500,
        agentName: "Harvey Specter",
        agentImage: "",
        beds: 4,
        baths: 4,
        sqft: 3600,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&fit=crop",
        reason: "Lifestyle and square-footage profile align with your premium second-home watchlist.",
    }
];

export function MarketFeed() {
    const [searchQuery, setSearchQuery] = useState("");
    const [mode, setMode] = useState<"cards" | "reels">("cards");

    const filteredListings = SAMPLE_LISTINGS.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by location, property type, or keyword..."
                        className="pl-9 bg-background border-input focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent border-border px-3 py-1.5 h-auto">
                        price: Any
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent border-border px-3 py-1.5 h-auto">
                        Beds: 2+
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent border-border px-3 py-1.5 h-auto">
                        Type: House
                    </Badge>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <div className="inline-flex rounded-lg border border-border overflow-hidden ml-1">
                        <button
                            type="button"
                            className={`px-3 py-1.5 text-xs ${mode === "cards" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
                            onClick={() => setMode("cards")}
                        >
                            Cards
                        </button>
                        <button
                            type="button"
                            className={`px-3 py-1.5 text-xs ${mode === "reels" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
                            onClick={() => setMode("reels")}
                        >
                            Reels
                        </button>
                    </div>
                </div>
            </div>

            {mode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <div key={listing.id} className="space-y-2">
                            <ListingCard
                                {...listing}
                                variant="market"
                                offers={0}
                                href={`/explore/agent/listing/${listing.id}`}
                            />
                            <div className="flex items-center gap-4 px-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BedDouble className="h-3 w-3" /> {listing.beds} Beds
                                </span>
                                <span className="flex items-center gap-1">
                                    <Bath className="h-3 w-3" /> {listing.baths} Baths
                                </span>
                                <span className="flex items-center gap-1">
                                    <Warehouse className="h-3 w-3" /> {listing.sqft.toLocaleString()} sqft
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-[74vh] overflow-y-auto snap-y snap-mandatory space-y-4 pr-1">
                    {filteredListings.map((listing) => (
                        <Card key={listing.id} className="relative h-[70vh] snap-start overflow-hidden border-border/80 bg-black">
                            <Link href={`/explore/agent/listing/${listing.id}`} className="absolute inset-0 z-10" aria-label={`Open ${listing.title} listing details`} />
                            {listing.video ? (
                                <video
                                    src={listing.video}
                                    poster={listing.image}
                                    className="h-full w-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2 z-20">
                                <h3 className="text-xl font-semibold text-white">{listing.title}</h3>
                                <p className="text-sm text-white/80">{listing.location}</p>
                                <p className="text-lg font-semibold text-white">{listing.price}</p>
                                <p className="text-sm text-white/90 inline-flex gap-2">
                                    <PlayCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    {listing.reason}
                                </p>
                                <div className="pt-2">
                                    <Button asChild size="sm" variant="secondary" className="bg-white/15 text-white hover:bg-white/25 border border-white/30 relative z-30">
                                        <Link href={`/explore/agent/listing/${listing.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            {filteredListings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No listings found matching your criteria.
                </div>
            )}
        </div>
    );
}
