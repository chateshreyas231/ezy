import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentBadge } from "./agent-badge";
import { Edit, Eye, MoreHorizontal, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ListingCardProps {
    title: string;
    location: string;
    price: string;
    status: "Active" | "Pending" | "Sold";
    views: number;
    offers?: number;
    agentName: string;
    agentImage?: string;
    variant?: "owner" | "market";
    href?: string;
}

export function ListingCard({
    title,
    location,
    price,
    status,
    views,
    offers,
    agentName,
    agentImage,
    variant = "owner",
    href,
}: ListingCardProps) {
    const card = (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all relative">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription>{location}</CardDescription>
                    </div>
                    <Badge variant={status === "Active" ? "default" : "secondary"} className={status === "Active" ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                        {status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3 space-y-4">
                <div className="flex justify-between items-end">
                    <div className="text-2xl font-bold font-mono">{price}</div>
                    <div className="text-xs text-muted-foreground mb-1">List Price</div>
                </div>

                {/* Pricing Guidance Widget */}
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-purple-300">Pricing Guidance</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-foreground">$2.6M - $2.8M</span>
                        <Badge variant="outline" className="border-green-500/20 text-green-400 text-[10px] h-5 px-1.5 gap-1">
                            <TrendingUp className="h-2 w-2" /> +8%
                        </Badge>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        />
                    </div>
                </div>

                {/* Market Insights Snippet */}
                <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Market Insights</div>
                    <ul className="space-y-1">
                        <li className="text-xs flex items-start gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5" />
                            <span>Priced 5% below neighborhood average.</span>
                        </li>
                        <li className="text-xs flex items-start gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5" />
                            <span>High demand: 124 similar views in 24h.</span>
                        </li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Total Views</span>
                        <span className="font-medium flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {views.toLocaleString()}
                        </span>
                    </div>
                    {variant === "owner" && (
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Active Offers</span>
                            <span className="font-medium text-foreground">{offers}</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-white/5 flex justify-between items-center bg-white/2">
                <AgentBadge name={agentName} image={agentImage} role="Listing Agent" />
                {variant === "owner" ? (
                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button size="sm" variant="outline" className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10">
                        Contact Agent
                    </Button>
                )}
            </CardFooter>
        </Card>
    );

    if (!href) return card;

    return (
        <Link href={href} className="block">
            {card}
        </Link>
    );
}
