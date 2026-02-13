"use client";

import { useState } from "react";
import { ListingCard } from "./listing-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Warehouse, BedDouble, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SAMPLE_LISTINGS = [
    {
        title: "Modern Glass Villa",
        location: "Beverly Hills, CA",
        price: "$2,500,000",
        status: "Active" as const,
        views: 1240,
        agentName: "Sarah Connor",
        agentImage: "",
        beds: 4,
        baths: 3.5,
        sqft: 3200
    },
    {
        title: "Downtown Penthouse",
        location: "New York, NY",
        price: "$4,200,000",
        status: "Active" as const,
        views: 3500,
        agentName: "John Smith",
        agentImage: "",
        beds: 3,
        baths: 3,
        sqft: 2800
    },
    {
        title: "Seaside Retreat",
        location: "Malibu, CA",
        price: "$5,800,000",
        status: "Active" as const,
        views: 890,
        agentName: "Jessica Pearson",
        agentImage: "",
        beds: 5,
        baths: 4.5,
        sqft: 4100
    },
    {
        title: "Urban Loft",
        location: "San Francisco, CA",
        price: "$1,800,000",
        status: "Active" as const,
        views: 2100,
        agentName: "Mike Ross",
        agentImage: "",
        beds: 2,
        baths: 2,
        sqft: 1500
    },
    {
        title: "Mountain Cabin",
        location: "Aspen, CO",
        price: "$3,400,000",
        status: "Active" as const,
        views: 1500,
        agentName: "Harvey Specter",
        agentImage: "",
        beds: 4,
        baths: 4,
        sqft: 3600
    }
];

export function MarketFeed() {
    const [searchQuery, setSearchQuery] = useState("");

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
                        className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <Badge variant="outline" className="cursor-pointer hover:bg-white/10 border-white/10 px-3 py-1.5 h-auto">
                        price: Any
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-white/10 border-white/10 px-3 py-1.5 h-auto">
                        Beds: 2+
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-white/10 border-white/10 px-3 py-1.5 h-auto">
                        Type: House
                    </Badge>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing, index) => (
                    <div key={index} className="space-y-2">
                        <ListingCard
                            {...listing}
                            variant="market"
                            offers={0} // Not used in market view
                        />
                        {/* Quick Specs for Market View */}
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
            {filteredListings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No listings found matching your criteria.
                </div>
            )}
        </div>
    );
}
