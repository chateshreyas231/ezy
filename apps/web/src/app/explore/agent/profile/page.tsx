"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { MOCK_USERS, MOCK_LISTINGS } from "@/lib/mock-data";
import { MapPin, Phone, Grid, User, Star, Globe, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type AgentPost = {
    id: string;
    title: string;
    image: string;
    type: "listing" | "lifestyle";
};

export default function AgentProfilePage() {
    const agent = MOCK_USERS.agent;
    const [isFollowing, setIsFollowing] = useState(false);

    // Enhanced Mock Data for Profile
    const highlights = [
        { id: 1, title: "Just Sold", image: "https://images.unsplash.com/photo-1600596542815-2a4d9f6facbe?q=80&w=200&h=200&fit=crop" },
        { id: 2, title: "Market Update", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200&h=200&fit=crop" },
        { id: 3, title: "Reviews", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop" },
        { id: 4, title: "Luxe Life", image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=200&h=200&fit=crop" },
    ];

    const posts: AgentPost[] = [
        ...MOCK_LISTINGS.filter((listing) => listing.agentId === agent.id).map((listing) => ({
            id: listing.id,
            title: listing.title,
            image: listing.images[0],
            type: "listing" as const,
        })),
        {
            id: "post-1",
            title: "Team Lunch at The Ivy",
            type: "lifestyle",
            image: "https://images.unsplash.com/photo-1515169067750-d51a73e56fea?q=80&w=800&fit=crop",
        },
        {
            id: "post-2",
            title: "Sunset Views",
            type: "lifestyle",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&fit=crop",
        },
    ];


    return (
        <DottedSurface className="min-h-screen pt-20 pb-12">
            <div className="max-w-4xl mx-auto bg-background/50 backdrop-blur-xl border-x border-border/50 min-h-screen shadow-2xl overflow-hidden">

                {/* 1. Cover Image (LinkedIn Style) */}
                <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>

                {/* 2. Profile Header */}
                <div className="px-6 md:px-10 pb-6 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">

                        {/* Avatar & Info */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            <div className="relative group cursor-pointer">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 cursor-pointer">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-background" />
                            </div>

                            <div className="text-center md:text-left mb-2">
                                <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2">
                                    {agent.name}
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs border-blue-200/20">Verified</Badge>
                                </h1>
                                <p className="text-muted-foreground font-medium">{agent.brokerage}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-1">
                                    <MapPin className="w-3 h-3" /> Los Angeles, CA
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <Button
                                className={`flex-1 md:flex-none transition-all duration-300 ${isFollowing ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                                onClick={() => setIsFollowing(!isFollowing)}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </Button>
                            <Button variant="outline" className="flex-1 md:flex-none">Message</Button>
                            <Button variant="ghost" size="icon" className="md:hidden"><Phone className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    {/* Bio & Links */}
                    <div className="mt-6 space-y-3 max-w-2xl text-center md:text-left mx-auto md:mx-0">
                        <p className="text-sm md:text-base leading-relaxed">
                            Luxury Real Estate Specialist 🏰 | Top 1% Nationwide 🏆 <br />
                            Helping you find your dream home in LA. 🌴 <br />
                            Design enthusiast. Architecture lover.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <a href="#" className="flex items-center gap-1 text-sm text-blue-500 hover:underline">
                                <Globe className="w-3 h-3" /> www.eliterealty.com/{agent.id}
                            </a>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-around md:justify-start md:gap-12 py-6 border-y border-border/50 mt-6">
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-bold">{agent.stats.active + agent.stats.sold}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Properties</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-bold">{(agent.stats.volume / 1000000).toFixed(1)}M</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Volume</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-bold">12.5K</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Followers</div>
                        </div>
                    </div>

                    {/* Highlights */}
                    <div className="flex gap-4 overflow-x-auto py-6 pb-2 scrollbar-none px-1">
                        {highlights.map((highlight) => (
                            <div key={highlight.id} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] bg-gradient-to-tr from-gray-200 to-gray-400 group-hover:from-pink-500 group-hover:to-yellow-500 transition-all duration-300">
                                    <div className="w-full h-full rounded-full border-4 border-background overflow-hidden relative">
                                        <img src={highlight.image} alt={highlight.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </div>
                                <span className="text-xs font-medium truncate w-16 text-center">{highlight.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Content Tabs */}
                <Tabs defaultValue="grid" className="w-full mt-2">
                    <TabsList className="w-full justify-around h-12 bg-transparent border-b border-border/50 rounded-none p-0">
                        <TabsTrigger
                            value="grid"
                            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent transition-all"
                        >
                            <Grid className="w-5 h-5" />
                        </TabsTrigger>
                        <TabsTrigger
                            value="about"
                            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent transition-all"
                        >
                            <User className="w-5 h-5" />
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent transition-all"
                        >
                            <Star className="w-5 h-5" />
                        </TabsTrigger>
                    </TabsList>

                    {/* Grid View (Instagram) */}
                    <TabsContent value="grid" className="p-0.5 min-h-[400px] animate-in fade-in duration-500">
                        <div className="grid grid-cols-3 gap-0.5">
                            {posts.map((post, i) => (
                                <motion.div
                                    key={i}
                                    layoutId={`post-${i}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="aspect-square relative group cursor-pointer bg-muted overflow-hidden"
                                >
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    {post.type === "listing" && (
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                            $2.5M
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white font-bold">
                                        <span className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white" /> 124</span>
                                        <span className="flex items-center gap-1"><MessageCircle className="w-5 h-5 fill-white" /> 12</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* About Tab (LinkedIn/Resume) */}
                    <TabsContent value="about" className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">About Me</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                I do not just sell homes; I curate lifestyles.
                                <br /><br />
                                With over 15 years of experience in the luxury real estate market of Los Angeles, James has built a reputation for his discretion, taste, and unparalleled negotiation skills. Specializing in off-market properties and celebrity estates, he brings a unique concierge approach to every transaction.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Experience</h4>
                                <p className="text-2xl font-bold">15+ Years</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Transactions</h4>
                                <p className="text-2xl font-bold">350+</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Avg Price</h4>
                                <p className="text-2xl font-bold">$4.2M</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Languages</h4>
                                <p className="text-sm font-medium">English, Spanish, French</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {["Luxury Homes", "Waterfront", "Investment", "Relocation", "Staging", "Negotiation", "Architecture"].map(tag => (
                                    <Badge key={tag} variant="secondary" className="px-3 py-1">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="p-6 md:p-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-6 mb-8 bg-muted/20 p-6 rounded-2xl border border-border/50">
                            <div className="text-center min-w-[100px]">
                                <div className="text-5xl font-bold text-primary">4.9</div>
                                <div className="text-xs text-muted-foreground mt-1">Average Rating</div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2 bg-muted rounded-full overflow-hidden w-full">
                                    <div className="h-full bg-yellow-500 w-[95%]" />
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Based on 128 Reviews</span>
                                    <span>Top Rated Agent</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-background/40 hover:bg-muted/30 transition-colors p-6 rounded-2xl border border-border/50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Jennifer Lawrence</p>
                                            <div className="flex text-yellow-500 text-xs">★★★★★</div>
                                        </div>
                                        <span className="ml-auto text-xs text-muted-foreground">2 weeks ago</span>
                                    </div>
                                    <p className="text-sm italic text-muted-foreground leading-relaxed">
                                        James is simply the best. He found us a property that was not even on the market yet. His connections are real. He understood exactly what we were looking for and did not waste our time.
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full h-12">Read All 128 Reviews</Button>
                    </TabsContent>
                </Tabs>

            </div>
        </DottedSurface>
    );
}
