"use client";

import { useState } from "react";
import { OverviewSection, type ClientDetailSelection } from "@/components/dashboard/client-dashboard-sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CircleDollarSign, Compass, FileText, Filter, Sparkles } from "lucide-react";

export default function DashboardOverviewPage() {
    const [detail, setDetail] = useState<ClientDetailSelection | null>({
        key: "journey_tracker",
        title: "Journey Tracker",
        summary: "Track milestones, blockers, and next steps for your active transaction.",
    });

    const detailContent: Record<ClientDetailSelection["key"], { icon: React.ReactNode; highlights: string[]; actions: string[] }> = {
        journey_tracker: {
            icon: <Compass className="h-5 w-5" />,
            highlights: [
                "Current stage: Search (14 active matches in your target market).",
                "Upcoming stage: Tour (2 appointments pending confirmation).",
                "Primary blocker: Earnest money confirmation due before next negotiation stage."
            ],
            actions: [
                "Open full milestone timeline",
                "Review blockers by due date",
                "Assign ownership for each pending task"
            ],
        },
        weekly_plan: {
            icon: <CalendarClock className="h-5 w-5" />,
            highlights: [
                "This week includes 3 high-priority tasks and 2 medium-priority tasks.",
                "Most urgent task: pre-approval upload needed for tour approvals.",
                "Plan includes legal review, inspection booking, and offer prep."
            ],
            actions: [
                "Generate weekly checklist",
                "Set due dates and reminders",
                "Share plan with agent and co-buyer"
            ],
        },
        deal_room: {
            icon: <FileText className="h-5 w-5" />,
            highlights: [
                "One active deal has urgent payment confirmation pending.",
                "Disclosure package includes two clauses requiring attorney follow-up.",
                "Tour logistics and communication history are available for review."
            ],
            actions: [
                "Open document checklist",
                "Review legal notes and comments",
                "Track all deadlines from one timeline"
            ],
        },
        new_matches: {
            icon: <Sparkles className="h-5 w-5" />,
            highlights: [
                "Three new properties match your current criteria and budget.",
                "Top match is priced 3.2% below neighborhood average.",
                "Two listings have tour availability in the next 72 hours."
            ],
            actions: [
                "Compare top 3 matches side-by-side",
                "Request tours for selected listings",
                "Archive listings that do not fit"
            ],
        },
        search_criteria: {
            icon: <Filter className="h-5 w-5" />,
            highlights: [
                "Current filters prioritize price and neighborhood fit.",
                "Expanding radius by 5 miles increases qualified inventory by 18%.",
                "Adding one alternate property type improves match quality in this market."
            ],
            actions: [
                "Adjust location and radius",
                "Edit must-haves and dealbreakers",
                "Save criteria profile for reuse"
            ],
        },
        what_if_simulator: {
            icon: <CircleDollarSign className="h-5 w-5" />,
            highlights: [
                "Base scenario monthly payment: $4,860.",
                "Rate reduction of 0.5% lowers monthly cost by approximately $270.",
                "Increasing down payment by 5% reduces monthly payment and closing risk."
            ],
            actions: [
                "Model payment by rate scenarios",
                "Model payment by down payment size",
                "Compare offer price scenarios before submission"
            ],
        },
    };

    const activeDetail = detail ? detailContent[detail.key] : null;

    return (
        <div className="space-y-6">
            <OverviewSection
                onOpenAI={() => {
                    window.dispatchEvent(new Event("ezriya:open-ai-chat"));
                }}
                onExploreDetail={(nextDetail) => setDetail(nextDetail)}
            />

            {detail && activeDetail && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {activeDetail.icon}
                                {detail.title}
                            </CardTitle>
                            <CardDescription className="mt-1">{detail.summary}</CardDescription>
                        </div>
                        <Badge variant="outline" className="border-white/20">Detailed View</Badge>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h4 className="text-sm font-semibold mb-3">Key Highlights</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {activeDetail.highlights.map((item) => (
                                    <li key={item} className="rounded-md border border-white/10 bg-black/10 p-3">{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-3">Available Actions</h4>
                            <div className="space-y-2">
                                {activeDetail.actions.map((action) => (
                                    <Button key={action} variant="outline" className="w-full justify-start">
                                        {action}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
