import React, { useState, useMemo, useEffect } from "react";
import SphereImageGrid, { ImageData } from "@/components/ui/image-sphere";
import AgentChatInterface from "@/components/agent-chat-interface";
import { MOCK_AGENTS, MOCK_LISTINGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, MapPin, Award, UserRoundCheck, ChevronLeft, ChevronRight, LayoutGrid, Globe, BarChart3, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FreelancerStatsCard } from "@/components/ui/stats-card";
import { HealthStatCard } from "@/components/ui/health-stat-card";

export default function AgentExploreView() {
    const [viewMode, setViewMode] = useState<"globe" | "split">("globe");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [showExploreGrid, setShowExploreGrid] = useState(false);
    const [viewportWidth, setViewportWidth] = useState<number>(1024);

    useEffect(() => {
        const updateViewport = () => setViewportWidth(window.innerWidth);
        updateViewport();
        window.addEventListener("resize", updateViewport);
        return () => window.removeEventListener("resize", updateViewport);
    }, []);

    const isMobile = viewportWidth < 768;

    // Transform MOCK_AGENTS to ImageData for the sphere.
    // Keep density controlled so the globe stays readable.
    const sphereImages: ImageData[] = useMemo(() => {
        const baseImages = MOCK_AGENTS.map((agent) => ({
            id: agent.id,
            src: agent.avatar,
            alt: agent.name,
            title: agent.name,
            description: `${agent.brokerage} • ${agent.location}`,
            agentId: agent.id
        }));

        const duplicateCount = isMobile ? 0 : 1;
        let allImages = [...baseImages];
        for (let i = 0; i < duplicateCount; i++) {
            const dups = baseImages.map(img => ({
                ...img,
                id: `${img.id}-dup-${i}`,
            }));
            allImages = [...allImages, ...dups];
        }

        return allImages;
    }, [isMobile]);

    const sphereConfig = useMemo(() => {
        if (viewMode === "split") {
            return isMobile
                ? { containerSize: 260, sphereRadius: 95, baseImageScale: 0.14 }
                : { containerSize: 420, sphereRadius: 165, baseImageScale: 0.11 };
        }
        return isMobile
            ? { containerSize: 320, sphereRadius: 125, baseImageScale: 0.13 }
            : { containerSize: 560, sphereRadius: 220, baseImageScale: 0.11 };
    }, [isMobile, viewMode]);

    const selectedAgent = useMemo(() => {
        return MOCK_AGENTS.find((a) => a.id === selectedAgentId) || null;
    }, [selectedAgentId]);

    const agentListings = useMemo(() => {
        if (!selectedAgentId) return [];
        return MOCK_LISTINGS.filter((l) => l.agentId === selectedAgentId);
    }, [selectedAgentId]);

    const modernStatsData = useMemo(() => {
        if (!selectedAgent) return null;

        const rankingIndex = Math.max(MOCK_AGENTS.findIndex((agent) => agent.id === selectedAgent.id), 0) + 1;
        const recentDeals = Math.max(1, Math.round(selectedAgent.stats.sold * 0.15));
        const topRank = Math.min(rankingIndex, 10);
        const medianDom = Math.max(14, 34 - Math.round((selectedAgent.experienceYears / 20) * 14));
        const listToSale = (97.2 + (selectedAgent.rating - 4.5) * 1.6).toFixed(1);
        const responseMinutes = Math.max(9, 32 - Math.round(selectedAgent.rating * 3));

        return {
            freelancerCard: {
                title: "Participant Metrics",
                timeFrame: "YTD",
                metricLabel: "Self-Reported Closed Volume",
                earnings: {
                    amount: selectedAgent.stats.volume,
                    change: 0,
                    changePeriod: "vs same period last year",
                    changeDisplay: "+11% vs same period last year",
                },
                subStats: [
                    { value: selectedAgent.stats.active, label: "active", subLabel: "live listings" },
                    { value: recentDeals, label: "closed", subLabel: "last 90 days" },
                ] as [{ value: number; label: string; subLabel: string }, { value: number; label: string; subLabel: string }],
                ranking: {
                    place: `Brokerage cohort ${topRank}`,
                    category: "participant-submitted activity context",
                    icon: <BarChart3 className="h-6 w-6 opacity-60" />,
                },
                availability: {
                    title: "Deal Pipeline",
                    bars: Array.from({ length: 24 }, (_, index) => {
                        const base = (selectedAgent.rating / 5) * 0.75;
                        const wave = Math.sin(index / 3) * 0.16;
                        const level = Math.max(0.1, Math.min(1, base + wave));
                        return { level };
                    }),
                    label: `${selectedAgent.stats.active} active opportunities`,
                    helpText: `Participant-submitted pipeline includes ${selectedAgent.stats.active} active listings and ${recentDeals} recent closings (last 90 days).`,
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
                    { label: "Retention", value: 77, color: "#EF4444", description: "Repeat client relationship health" },
                ],
            },
        };
    }, [selectedAgent]);

    // Handle Search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setViewMode("split");
        setShowExploreGrid(false);

        // Simple mock logic to select an agent based on query to demo functionality
        // In a real app, this would be an AI search
        if (query) {
            // Just pick a random agent for the demo if none selected
            if (!selectedAgentId) {
                const randomAgent = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
                setSelectedAgentId(randomAgent.id);
            }
        }
    };

    const handleAgentClick = (image: ImageData) => {
        if (image.agentId) {
            setSelectedAgentId(image.agentId);
            setViewMode("split");
            setShowExploreGrid(false);
        }
    };

    const handleReset = () => {
        setViewMode("globe");
        setSelectedAgentId(null);
        setSearchQuery("");
        setShowExploreGrid(false);
    };

    const handleNextAgent = () => {
        const currentIndex = MOCK_AGENTS.findIndex(a => a.id === selectedAgentId);
        const nextIndex = (currentIndex + 1) % MOCK_AGENTS.length;
        setSelectedAgentId(MOCK_AGENTS[nextIndex].id);
    };

    const handlePrevAgent = () => {
        const currentIndex = MOCK_AGENTS.findIndex(a => a.id === selectedAgentId);
        const prevIndex = (currentIndex - 1 + MOCK_AGENTS.length) % MOCK_AGENTS.length;
        setSelectedAgentId(MOCK_AGENTS[prevIndex].id);
    };

    const toggleExploreGrid = () => {
        setShowExploreGrid(!showExploreGrid);
    };

    return (
        <div className="relative flex min-h-[calc(100dvh-4rem)] w-full flex-col overflow-y-auto md:h-[calc(100vh-4rem)] md:flex-row md:overflow-hidden">
            {/* Background gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-primary/5 -z-10" />

            {/* LEFT SIDE (Globe) */}
            {!(isMobile && viewMode === "split") && (
                <motion.div
                    className={cn(
                        "relative flex min-h-[70vh] flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:min-h-0",
                        viewMode === "split" ? "w-full md:w-1/2 lg:w-5/12 md:scale-90 md:opacity-90" : "w-full h-full"
                    )}
                    initial={false}
                    animate={{ opacity: 1 }}
                >
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {viewMode === "globe" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute inset-x-0 top-6 z-10 mx-auto max-w-3xl space-y-2 px-4 text-center md:top-10"
                            >
                                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary mb-2">
                                    Agent Directory
                                </Badge>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                                    Explore Agent Profiles
                                </h1>
                                <p className="text-muted-foreground text-sm md:text-lg max-w-lg mx-auto">
                                    Browse participant-submitted profiles, filters, and listing activity for review.
                                </p>
                            </motion.div>
                        )}

                        {/* Explore Mode Toggle */}
                        {viewMode === "globe" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute right-3 top-3 z-20 md:right-4 md:top-4"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleExploreGrid}
                                    className="bg-white text-foreground border-neutral-200 hover:bg-white/90 backdrop-blur-md shadow-sm text-xs md:text-sm"
                                >
                                    {showExploreGrid ? (
                                        <>
                                            <Globe className="w-4 h-4 mr-2" />
                                            Globe View
                                        </>
                                    ) : (
                                        <>
                                            <LayoutGrid className="w-4 h-4 mr-2" />
                                            Explore All Agents
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        <div className={cn(
                            "transition-all duration-700 delay-100 flex-1 flex items-center justify-center",
                            viewMode === "split" ? "scale-90 md:scale-75 md:-ml-8" : "scale-100"
                        )}>
                            {!showExploreGrid ? (
                                <SphereImageGrid
                                    images={sphereImages}
                                    containerSize={sphereConfig.containerSize}
                                    sphereRadius={sphereConfig.sphereRadius}
                                    baseImageScale={sphereConfig.baseImageScale}
                                    autoRotate={true}
                                    onImageClick={handleAgentClick}
                                    selectedId={selectedAgentId}
                                />
                            ) : (
                                <div className="h-[52vh] w-[92vw] max-w-[960px] overflow-y-auto p-3 md:h-[600px] md:p-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-20 md:mt-36">
                                    {MOCK_AGENTS.map(agent => (
                                        <Card
                                            key={agent.id}
                                            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg group"
                                            onClick={() => {
                                                setSelectedAgentId(agent.id);
                                                setViewMode("split");
                                                setShowExploreGrid(false);
                                            }}
                                        >
                                            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-muted group-hover:border-primary transition-colors">
                                                    <Image src={agent.avatar} alt={agent.name} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{agent.name}</div>
                                                    <div className="text-xs text-muted-foreground">{agent.brokerage}</div>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    {agent.rating} User-submitted rating
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={cn(
                            "absolute transition-all duration-500 w-full px-4 max-w-2xl",
                            viewMode === "split" ? "bottom-6 md:bottom-8" : "bottom-6 md:bottom-12"
                        )}>
                            <AgentChatInterface
                                onSearch={handleSearch}
                                isExpanded={viewMode === "globe"}
                                className={viewMode === "split" ? "max-w-md mx-auto" : ""}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* RIGHT SIDE (Agent Details / Explore Grid) */}
            <AnimatePresence>
                {viewMode === "split" && selectedAgent && (
                    <motion.div
                        initial={isMobile ? { y: 40, opacity: 0 } : { x: "100%", opacity: 0 }}
                        animate={{ x: 0, y: 0, opacity: 1 }}
                        exit={isMobile ? { y: 40, opacity: 0 } : { x: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative right-0 top-0 z-20 h-full w-full overflow-y-auto border-t border-border/50 bg-background/65 shadow-2xl backdrop-blur-3xl md:w-1/2 md:border-l md:border-t-0 lg:w-7/12"
                    >
                        <div className="space-y-6 p-4 md:p-8">
                            <Button variant="ghost" size="sm" onClick={handleReset} className="mb-2">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Globe
                            </Button>

                            {/* Header Section */}
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="relative">
                                    {/* Navigation Arrows Removed */}

                                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-4 border-background shadow-xl">
                                        <Image
                                            src={selectedAgent.avatar}
                                            alt={selectedAgent.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-sm">
                                        <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-background animate-pulse" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold">{selectedAgent.name}</h2>
                                            <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                                                <Building2 className="w-4 h-4" /> {selectedAgent.brokerage}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center rounded-full border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden mr-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-none hover:bg-primary/10"
                                                    onClick={(e) => { e.stopPropagation(); handlePrevAgent(); }}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <div className="w-[1px] h-4 bg-border/50" />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-none hover:bg-primary/10"
                                                    onClick={(e) => { e.stopPropagation(); handleNextAgent(); }}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 px-3 py-1">
                                                Participant profile
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {selectedAgent.specialties.map(s => (
                                            <Badge key={s} variant="secondary" className="bg-primary/5 hover:bg-primary/10 transition-colors">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {modernStatsData && (
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                            Participant Metrics Snapshot
                                        </h3>
                                        <Badge variant="outline" className="bg-background/70 backdrop-blur-sm">
                                            Self-reported data
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                        <FreelancerStatsCard
                                            className="max-w-none border-primary/20 bg-gradient-to-b from-background to-primary/5"
                                            {...modernStatsData.freelancerCard}
                                        />
                                        <HealthStatCard
                                            className="max-w-none border-primary/20 bg-gradient-to-b from-background to-primary/5"
                                            headerIcon={<Activity className="h-5 w-5" />}
                                            title="Seller Confidence Signals"
                                            stats={modernStatsData.healthCard.stats}
                                            graphData={modernStatsData.healthCard.graphData}
                                            graphHeight={110}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Active Listings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        Active Listings
                                    </h3>
                                    <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agentListings.map(listing => (
                                        <Link href={`/listing/${listing.id}`} key={listing.id} className="group">
                                            <div className="rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                                                <div className="relative aspect-[4/3]">
                                                    <Image
                                                        src={listing.images[0]}
                                                        alt={listing.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                                        {listing.status}
                                                    </div>
                                                    <div className="absolute bottom-3 left-3 text-white">
                                                        <div className="font-bold text-lg">${(listing.price / 1000000).toFixed(2)}M</div>
                                                        <div className="text-xs opacity-90 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {listing.location}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-medium truncate">{listing.title}</h4>
                                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                                        <span>{listing.specs.beds} Beds</span>
                                                        <span>{listing.specs.baths} Baths</span>
                                                        <span>{listing.specs.sqft.toLocaleString()} Sqft</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {agentListings.length === 0 && (
                                        <div className="col-span-2 py-8 text-center bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                                            <p className="text-muted-foreground">No active listings currently available.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Insight / Chat Context */}
                            {searchQuery && (
                                <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                                            <UserRoundCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Why this suggestion?</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Based on your search for <span className="text-foreground font-medium">&quot;{searchQuery}&quot;</span>,
                                                this profile is shown for review using participant-submitted specialties, location, and activity fields.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button className="flex-1 h-12 text-base shadow-lg shadow-primary/20">
                                    Contact Agent
                                </Button>
                                <Button variant="outline" className="flex-1 h-12 text-base" asChild>
                                    <Link href={`/explore/agent/${selectedAgent.id}`}>
                                        View Full Profile
                                    </Link>
                                </Button>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
