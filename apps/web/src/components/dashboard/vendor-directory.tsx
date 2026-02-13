"use client";

import { useState } from "react";
import { VendorCard } from "./vendor-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SAMPLE_VENDORS = [
    {
        name: "Sarah Jenkins",
        role: "Real Estate Agent",
        company: "Luxury Estates",
        location: "Beverly Hills, CA",
        rating: 4.9,
        reviews: 124,
        specialties: ["Luxury Homes", "Waterfront", "Relocation"],
        isVerified: true,
        category: "agents"
    },
    {
        name: "Michael Chang",
        role: "Property Inspector",
        company: "Precision Inspections",
        location: "Los Angeles, CA",
        rating: 4.8,
        reviews: 89,
        specialties: ["Structural", "Termite", "Mold"],
        isVerified: true,
        category: "inspection"
    },
    {
        name: "Elena Rodriguez",
        role: "Interior Designer",
        company: "Elena Interiors",
        location: "West Hollywood, CA",
        rating: 5.0,
        reviews: 42,
        specialties: ["Staging", "Modern Design", "Renovation"],
        isVerified: false,
        category: "staging"
    },
    {
        name: "David Wright",
        role: "Real Estate Attorney",
        company: "Wright & Associates",
        location: "Santa Monica, CA",
        rating: 4.7,
        reviews: 56,
        specialties: ["Contracts", "Closing", "Title"],
        isVerified: true,
        category: "legal"
    },
    {
        name: "Jessica Chen",
        role: "Real Estate Agent",
        company: "Urban Living",
        location: "Downtown LA",
        rating: 4.6,
        reviews: 78,
        specialties: ["Lofts", "First-time Buyers", "Condos"],
        isVerified: true,
        category: "agents"
    }
];

export function VendorDirectory() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredVendors = SAMPLE_VENDORS.filter(vendor => {
        const matchesCategory = activeCategory === "all" || vendor.category === activeCategory;
        const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.role.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents, inspectors, legal, and staging..."
                        className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
                    <TabsList className="bg-white/5 border border-white/10 p-1 w-full md:w-auto overflow-x-auto justify-start">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                        <TabsTrigger value="inspection">Inspection</TabsTrigger>
                        <TabsTrigger value="staging">Staging</TabsTrigger>
                        <TabsTrigger value="legal">Legal</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor, index) => (
                    <VendorCard key={index} {...vendor} />
                ))}
            </div>

            {filteredVendors.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No vendors found matching your criteria.
                </div>
            )}
        </div>
    );
}
