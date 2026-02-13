"use client";

import { type CSSProperties, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiriOrb } from "@/components/ui/siri-orb";
import { GradientSkewCard } from "@/components/ui/gradient-card-showcase";

interface AIOverviewProps {
    onReviewMatches?: () => void;
    onUpdateSearchCriteria?: () => void;
}

const INFO_BORDER_ACCENT = "--info-border-accent";

type PanelStyle = CSSProperties & Record<typeof INFO_BORDER_ACCENT, string>;

const panelStyle = (accent: string): PanelStyle => ({
    [INFO_BORDER_ACCENT]: accent,
});

const handlePanelMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    event.currentTarget.style.setProperty("--rotation", `${Math.atan2(y, x)}rad`);
};

const handlePanelMouseLeave = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--rotation", "0deg");
};

export function AIOverview({ onReviewMatches, onUpdateSearchCriteria }: AIOverviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <GradientSkewCard
                title="Market Intelligence"
                description="Monitoring market movement, tracking new listings, and surfacing recommendations for active clients."
                gradientFrom="#03a9f4"
                gradientTo="#ff0058"
                className="w-full min-h-[240px]"
            >
                <div
                    className="absolute inset-0 z-0"
                    style={panelStyle("var(--info-border-color-2)")}
                    onMouseMove={handlePanelMouseMove}
                    onMouseLeave={handlePanelMouseLeave}
                />
                <div className="relative z-10 mt-4 p-1">
                    <div className="mb-4 flex flex-col items-center gap-6 md:flex-row">
                        <div className="relative rounded-full border border-white/10 bg-background/60 p-1">
                            <SiriOrb size="56px" animationDuration={16} />
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                        </div>
                        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-normal text-white">
                            Live Updates
                        </span>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-4 md:w-auto">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="info-panel bg-transparent border-0 shadow-none rounded-xl p-[2px]" style={panelStyle("var(--info-border-color-1)")}>
                                <div className="info-panel-inner rounded-[0.65rem] p-3 flex flex-col items-center justify-center min-w-[120px]">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <TrendingUp className="h-3 w-3 text-green-400" /> Market Impact
                                    </span>
                                    <span className="text-xl font-bold font-mono text-foreground">+12.5%</span>
                                </div>
                            </div>
                            <div className="info-panel bg-transparent border-0 shadow-none rounded-xl p-[2px]" style={panelStyle("var(--info-border-color-3)")}>
                                <div className="info-panel-inner rounded-[0.65rem] p-3 flex flex-col items-center justify-center min-w-[120px]">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <Zap className="h-3 w-3 text-blue-400" /> Opportunities
                                    </span>
                                    <span className="text-xl font-bold font-mono text-foreground">3 New</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 border-t border-white/10 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span>Recommended Actions:</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                                onClick={onReviewMatches}
                            >
                                Review 3 New Matches
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                                onClick={onUpdateSearchCriteria}
                            >
                                Update Search Criteria
                            </Button>
                        </div>
                    </div>
                </div>
            </GradientSkewCard>
        </motion.div>
    );
}
