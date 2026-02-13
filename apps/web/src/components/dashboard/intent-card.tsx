import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentBadge } from "./agent-badge";
import { Sparkles, Target, Radar, ArrowRight } from "lucide-react";

interface IntentCardProps {
    title: string;
    budget: string;
    location: string;
    matchScore: number;
    status: "Searching" | "Negotiating" | "Closed";
    agentName: string;
    agentImage?: string;
}

export function IntentCard({
    title,
    budget,
    location,
    matchScore,
    status,
    agentName,
    agentImage,
}: IntentCardProps) {
    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all relative">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 h-fit border border-blue-500/20">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription>{location}</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-blue-500/20 text-blue-400 bg-blue-500/5">
                        {status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3 space-y-4">
                <div className="flex justify-between items-end">
                    <div className="text-xl font-bold font-mono">{budget}</div>
                    <div className="text-xs text-muted-foreground mb-1">Target Budget</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full" />

                    <div className="flex justify-between items-center mb-2 relative z-10">
                        <span className="text-xs text-purple-400 font-medium flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" /> Match Score
                        </span>
                        <span className="text-lg font-bold text-foreground">{matchScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 animate-pulse"
                            style={{ width: `${matchScore}%` }}
                        />
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs relative z-10">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Radar className="h-3 w-3 animate-spin-slow text-blue-400" />
                            Monitoring 1,240 listings...
                        </span>
                        <span className="text-blue-400 font-medium">+3 new</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-white/5 flex justify-between items-center bg-white/2">
                <AgentBadge name={agentName} image={agentImage} role="Preferred Agent" />
                <Button size="sm" variant="ghost" className="text-xs hover:bg-white/10 group-hover:text-primary transition-colors">
                    View Matches <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
            </CardFooter>
        </Card>
    );
}
