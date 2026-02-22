"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    INTENT_LABEL,
    formatCompactCurrency,
    type ClientDashboardSnapshot,
    type ClientDetailSelection,
} from "@/components/dashboard/client-dashboard-sections";
import { SiriOrb } from "@/components/ui/siri-orb";
import { ChatMessage } from "@/components/dashboard/chat-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    CalendarClock,
    Compass,
    Handshake,
    Mic,
    Send,
    Sparkles,
    Volume2,
} from "lucide-react";
import {
    appendConversationLog,
    appendBuyingPlan,
    appendSellerListing,
} from "@/lib/workspace-ai-store";

type WorkspaceMessage = {
    role: "user" | "ai";
    content: string;
};

type SpeechRecognitionResultEventLike = {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type BrowserSpeechRecognition = {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
    start: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type AssistantFlow = {
    kind: "buy" | "sell";
    step: number;
    answers: string[];
    awaitingConfirmation: boolean;
    summary: string;
} | null;

const BUY_INTENT_QUESTIONS = [
    "Great. Which city/area are you targeting?",
    "What is your budget range?",
    "What property type do you want (condo, townhouse, single-family, etc.)?",
    "What are your must-haves (beds/baths, commute, schools, amenities)?",
    "What is your timeline to buy?",
];

const SELL_INTENT_QUESTIONS = [
    "Great. What is the property address or area?",
    "What property type are you selling?",
    "What is your expected listing price?",
    "Share specs (beds, baths, sqft). Example: 3 bed, 2 bath, 1800 sqft.",
    "Do you have photos ready? (yes/no)",
    "Do you have videos/virtual tour ready? (yes/no)",
    "Do you have floorplans ready? (yes/no)",
    "What is your ideal timeline to list?",
];

const snapshot: ClientDashboardSnapshot = {
    clientId: "demo-client",
    journeys: [
        {
            id: "journey-buy-123-main",
            clientId: "demo-client",
            propertyId: "listing-123-main",
            intentType: "buy",
            stage: "offers",
            monetaryImpactEstimate: 980000,
            urgencyScore: 86,
            label: "123 Main St",
            primaryMetrics: [
                { label: "Tours", value: "4" },
                { label: "Offers", value: "1" },
                { label: "Contingencies", value: "2 left" },
            ],
            nextDueDate: "2026-02-21",
        },
        {
            id: "journey-sell-lake-house",
            clientId: "demo-client",
            propertyId: "listing-lake-house",
            intentType: "sell",
            stage: "listed",
            monetaryImpactEstimate: 1500000,
            urgencyScore: 73,
            label: "Lake House",
            primaryMetrics: [
                { label: "DOM", value: "12" },
                { label: "Showings", value: "9" },
                { label: "Offers", value: "2" },
            ],
            nextDueDate: "2026-02-23",
        },
        {
            id: "journey-rent-out-unit-4b",
            clientId: "demo-client",
            propertyId: "listing-unit-4b",
            intentType: "rent_out",
            stage: "leased",
            monetaryImpactEstimate: 4600,
            urgencyScore: 64,
            label: "Unit 4B",
            primaryMetrics: [
                { label: "Occupancy", value: "100%" },
                { label: "Late Payments", value: "0" },
                { label: "Open Tickets", value: "1" },
            ],
            nextDueDate: "2026-02-28",
        },
        {
            id: "journey-renting-current-home",
            clientId: "demo-client",
            propertyId: "listing-current-home",
            intentType: "renting",
            stage: "active_tenancy",
            monetaryImpactEstimate: 3200,
            urgencyScore: 38,
            label: "Current Home",
            primaryMetrics: [
                { label: "Lease End", value: "Nov 2026" },
                { label: "Next Rent", value: "$3,200" },
                { label: "Open Issues", value: "0" },
            ],
        },
    ],
    intentsSummary: {
        buyCount: 1,
        sellCount: 1,
        rentOutCount: 1,
        rentingCount: 1,
    },
    prioritizedJourneys: [],
    totals: {
        potentialPurchaseVolume: 980000,
        potentialSaleProceeds: 1500000,
        monthlyRentIn: 4600,
        monthlyRentOut: 3200,
    },
};

snapshot.prioritizedJourneys = [...snapshot.journeys].sort((a, b) => {
    const scoreA = a.urgencyScore * 100000 + a.monetaryImpactEstimate;
    const scoreB = b.urgencyScore * 100000 + b.monetaryImpactEstimate;
    return scoreB - scoreA;
});

function toContextMessage(detail: ClientDetailSelection) {
    const lane = detail.intentType ? INTENT_LABEL[detail.intentType] : "Client";
    return `${lane} focus requested: ${detail.title}. ${detail.summary}`;
}

function getSpeechRecognitionConstructor(): BrowserSpeechRecognitionConstructor | undefined {
    if (typeof window === "undefined") return undefined;
    const speechWindow = window as Window & {
        SpeechRecognition?: BrowserSpeechRecognitionConstructor;
        webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

export default function DashboardOverviewPage() {
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([
        {
            role: "ai",
            content:
                "I am live in your workspace. Ask me to prioritize journeys, compare buy vs sell lanes, or prepare your next action list.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [assistantFlow, setAssistantFlow] = useState<AssistantFlow>(null);
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const primaryJourney = snapshot.prioritizedJourneys[0];
    const activeJourneyCount = snapshot.prioritizedJourneys.length;
    const highPriorityCount = snapshot.prioritizedJourneys.filter((j) => j.urgencyScore >= 70).length;
    const intentMix = `${snapshot.intentsSummary.buyCount} buy • ${snapshot.intentsSummary.sellCount} sell • ${snapshot.intentsSummary.rentOutCount} rent_out • ${snapshot.intentsSummary.rentingCount} renting`;

    const financialSurface = useMemo(
        () => snapshot.totals.potentialPurchaseVolume + snapshot.totals.potentialSaleProceeds,
        []
    );
    const actionQueue = useMemo(
        () =>
            snapshot.prioritizedJourneys.slice(0, 3).map((journey) => ({
                id: journey.id,
                title: `${INTENT_LABEL[journey.intentType]}: ${journey.label}`,
                reason: `Stage "${journey.stage}" has urgency ${journey.urgencyScore}.`,
                due: journey.nextDueDate
                    ? new Date(journey.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Review now",
                journey,
            })),
        []
    );

    function addWorkspaceMessage(role: "user" | "ai", content: string, persist = true) {
        setMessages((prev) => [...prev, { role, content }]);
        if (!persist) return;
        appendConversationLog({
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            role,
            content,
            createdAt: new Date().toISOString(),
        });
    }

    function handleExploreDetail(detail: ClientDetailSelection) {
        inputRef.current?.focus();
        addWorkspaceMessage("ai", toContextMessage(detail));
    }

    function startBuyIntentFlow() {
        setAssistantFlow({
            kind: "buy",
            step: 0,
            answers: [],
            awaitingConfirmation: false,
            summary: "",
        });
        addWorkspaceMessage("ai", "Starting buyer intent creation.");
        addWorkspaceMessage("ai", BUY_INTENT_QUESTIONS[0]);
    }

    function startSellIntentFlow() {
        setAssistantFlow({
            kind: "sell",
            step: 0,
            answers: [],
            awaitingConfirmation: false,
            summary: "",
        });
        addWorkspaceMessage("ai", "Starting seller listing creation.");
        addWorkspaceMessage("ai", SELL_INTENT_QUESTIONS[0]);
    }

    function parseSpecs(text: string) {
        const beds = Number((text.match(/(\d+)\s*(bed|bd)/i)?.[1] ?? "0")) || 0;
        const baths = Number((text.match(/(\d+(\.\d+)?)\s*(bath|ba)/i)?.[1] ?? "0")) || 0;
        const sqft = Number((text.match(/(\d{3,6})\s*(sqft|sq ft)/i)?.[1] ?? "0")) || 0;
        return { beds, baths, sqft };
    }

    function isAffirmative(text: string) {
        return /^(yes|y|confirm|confirmed|sure|ok|okay)$/i.test(text.trim());
    }

    function buildBuySummary(answers: string[]) {
        const [location, budget, propertyType, mustHaves, timeline] = answers;
        return `Buyer intent summary:
- Area: ${location}
- Budget: ${budget}
- Property Type: ${propertyType}
- Must-haves: ${mustHaves}
- Timeline: ${timeline}`;
    }

    function buildSellSummary(answers: string[]) {
        const [location, propertyType, price, specs, photos, videos, floorplans, timeline] = answers;
        return `Seller listing summary:
- Area/Address: ${location}
- Property Type: ${propertyType}
- Target Price: ${price}
- Specs: ${specs}
- Photos: ${photos}
- Videos: ${videos}
- Floorplans: ${floorplans}
- Timeline: ${timeline}`;
    }

    function persistConfirmedIntent(flow: Exclude<AssistantFlow, null>) {
        if (flow.kind === "buy") {
            const [location, budget, propertyType, mustHaves, timeline] = flow.answers;
            appendBuyingPlan({
                id: `ai-buy-${Date.now()}`,
                title: `${propertyType || "Home"} in ${location || "Target Area"}`,
                location: location || "TBD",
                budget: budget || "TBD",
                status: "Searching",
                matchScore: 88,
                summary: `Must-haves: ${mustHaves || "N/A"} | Timeline: ${timeline || "N/A"}`,
                createdAt: new Date().toISOString(),
            });
            addWorkspaceMessage(
                "ai",
                "Confirmed. Buyer intent created and saved in Buying Plans. I will now organize matching information for your review."
            );
            return;
        }

        const [location, propertyType, price, specs, photos, videos, floorplans, timeline] = flow.answers;
        const parsed = parseSpecs(specs ?? "");
        appendSellerListing({
            id: `ai-sell-${Date.now()}`,
            title: `${propertyType || "Property"} in ${location || "Target Area"}`,
            location: location || "TBD",
            price: price || "TBD",
            status: "Active",
            beds: parsed.beds,
            baths: parsed.baths,
            sqft: parsed.sqft,
            mediaChecklist: {
                photos: /yes|ready|uploaded/i.test(photos ?? ""),
                videos: /yes|ready|uploaded/i.test(videos ?? ""),
                floorplans: /yes|ready|uploaded/i.test(floorplans ?? ""),
            },
            strategyNotes: `Timeline: ${timeline || "N/A"} | Information: market comps and staging checklist for user review.`,
            createdAt: new Date().toISOString(),
        });
        addWorkspaceMessage(
            "ai",
            "Confirmed. Seller listing intent created and saved in My Listings. I will now organize launch information and matching records for your review."
        );
    }

    function generateReply(userText: string) {
        const text = userText.toLowerCase();

        if (text.includes("priority") || text.includes("urgent")) {
            const top = snapshot.prioritizedJourneys.slice(0, 2).map((j) => j.label).join(" and ");
            return `Top priority lanes right now are ${top}. Review these first based on urgency score and financial impact.`;
        }

        if (text.includes("buy") || text.includes("budget")) {
            return `Your buying lane is in "${primaryJourney?.stage ?? "searching"}" with projected purchase volume around ${formatCompactCurrency(snapshot.totals.potentialPurchaseVolume)}.`;
        }

        if (text.includes("sell")) {
            return `Your selling lane projects ${formatCompactCurrency(snapshot.totals.potentialSaleProceeds)} with strongest action in the next 48 hours on showing-to-offer conversion.`;
        }

        if (text.includes("weekly") || text.includes("plan")) {
            return "Weekly plan drafted: 1) review top two journeys, 2) confirm deadlines, 3) trigger outreach for pending offers.";
        }

        return "Understood. I can map this into your active journeys and open the full assistant for step-by-step execution.";
    }

    function speak(text: string) {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }

    function sendMessage(messageText?: string) {
        const text = (messageText ?? input).trim();
        if (!text) return;

        addWorkspaceMessage("user", text);
        setInput("");

        if (assistantFlow) {
            const questions = assistantFlow.kind === "buy" ? BUY_INTENT_QUESTIONS : SELL_INTENT_QUESTIONS;

            if (assistantFlow.awaitingConfirmation) {
                if (isAffirmative(text)) {
                    persistConfirmedIntent(assistantFlow);
                } else {
                    addWorkspaceMessage(
                        "ai",
                        "Understood. I canceled this draft. Say 'start buy intent' or 'start sell listing' to begin again."
                    );
                }
                setAssistantFlow(null);
                return;
            }

            const nextAnswers = [...assistantFlow.answers, text];
            const nextStep = assistantFlow.step + 1;

            if (nextStep < questions.length) {
                setAssistantFlow({
                    ...assistantFlow,
                    step: nextStep,
                    answers: nextAnswers,
                });
                addWorkspaceMessage("ai", questions[nextStep]);
                return;
            }

            const summary = assistantFlow.kind === "buy" ? buildBuySummary(nextAnswers) : buildSellSummary(nextAnswers);
            setAssistantFlow({
                ...assistantFlow,
                answers: nextAnswers,
                awaitingConfirmation: true,
                summary,
            });
            addWorkspaceMessage("ai", `${summary}\n\nReply 'confirm' to save this intent, or anything else to cancel.`);
            return;
        }

        const lowered = text.toLowerCase();
        if (lowered.includes("start buy") || lowered.includes("buy intent") || lowered === "buy") {
            startBuyIntentFlow();
            return;
        }
        if (lowered.includes("start sell") || lowered.includes("sell listing") || lowered === "sell") {
            startSellIntentFlow();
            return;
        }

        const reply = generateReply(text);
        setTimeout(() => {
            addWorkspaceMessage("ai", reply);
        }, 450);
    }

    function startVoiceInput() {
        if (typeof window === "undefined") return;

        const SpeechRecognitionCtor = getSpeechRecognitionConstructor();

        if (!SpeechRecognitionCtor) {
            addWorkspaceMessage("ai", "Voice input is not available in this browser. You can keep chatting using text.");
            return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
            const transcript = event?.results?.[0]?.[0]?.transcript ?? "";
            if (transcript) sendMessage(transcript);
        };

        recognition.start();
    }

    if (!mounted) {
        return (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_420px] xl:h-[calc(100vh-12rem)]">
                <div className="rounded-xl border border-slate-200 bg-white" />
                <div className="rounded-xl border border-slate-200 bg-white" />
            </div>
        );
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_420px] xl:h-[calc(100vh-12rem)] xl:overflow-hidden">
            <div className="xl:h-full">
                <Card className="border-slate-200 bg-white xl:h-full xl:flex xl:flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-xl">AI Workspace Live</CardTitle>
                            <Badge variant="outline" className="border-white/20">
                                {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 xl:flex-1 xl:min-h-0 xl:flex xl:flex-col">
                        <div className="flex flex-col md:flex-row items-center gap-6 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
                                <div className="relative rounded-full border border-slate-200 bg-white p-2">
                                    <SiriOrb size="140px" animationDuration={14} />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Conversation-First Client Workspace
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                                    This workspace helps organize buyer intents and seller listings, collect required media/questions, and save details for review.
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground max-w-2xl">
                                    User controls all decisions. AI does not provide legal, financial, or real estate advice.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                    <Button onClick={startBuyIntentFlow}>
                                        Start Buy Intent
                                    </Button>
                                    <Button variant="outline" onClick={startSellIntentFlow}>
                                        Start Sell Listing
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[380px] xl:max-h-none xl:flex-1 xl:min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-4">
                                {messages.map((message, index) => (
                                    <ChatMessage key={`${message.role}-${index}`} role={message.role} content={message.content} />
                                ))}
                            </div>
                        </div>

                        <form
                            className="flex gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                sendMessage();
                            }}
                        >
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Type: start buy intent, start sell listing, or ask for information..."
                            />
                            <Button type="button" variant="outline" size="icon" onClick={startVoiceInput}>
                                <Mic className={`h-4 w-4 ${isListening ? "text-blue-400" : ""}`} />
                            </Button>
                            <Button type="submit" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={startBuyIntentFlow}>
                                Create Buying Plan
                            </Button>
                            <Button variant="outline" size="sm" onClick={startSellIntentFlow}>
                                Create Selling Listing
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => sendMessage("What are my highest priority tasks this week?")}>
                                Priority Tasks
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => sendMessage("Summarize my buy and sell lanes")}>
                                Lane Summary
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => speak(messages[messages.length - 1]?.content ?? "")}>
                                <Volume2 className="h-4 w-4 mr-2" />
                                Speak Last Reply
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 xl:h-full xl:overflow-y-auto xl:pr-1">
                <Card className="bg-white border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Workspace Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-primary/30 transition-colors"
                            onClick={() => handleExploreDetail({
                                key: "journey_tracker",
                                title: "Open Journeys",
                                summary: `${activeJourneyCount} active journey lanes.`,
                                intentType: primaryJourney?.intentType,
                                listingId: primaryJourney?.propertyId,
                            })}
                        >
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Handshake className="h-3.5 w-3.5" /> Open Journeys</p>
                            <p className="mt-1 text-xl font-semibold">{activeJourneyCount}</p>
                        </button>
                        <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-primary/30 transition-colors"
                            onClick={() => handleExploreDetail({
                                key: "search_criteria",
                                title: "Intent Mix",
                                summary: intentMix,
                                intentType: primaryJourney?.intentType,
                                listingId: primaryJourney?.propertyId,
                            })}
                        >
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Compass className="h-3.5 w-3.5" /> Intent Mix</p>
                            <p className="mt-1 text-sm font-medium">{intentMix}</p>
                        </button>
                        <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-primary/30 transition-colors"
                            onClick={() => handleExploreDetail({
                                key: "weekly_plan",
                                title: "High Priority",
                                summary: `${highPriorityCount} journeys have urgency >= 70.`,
                                intentType: primaryJourney?.intentType,
                                listingId: primaryJourney?.propertyId,
                            })}
                        >
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> High Priority</p>
                            <p className="mt-1 text-xl font-semibold">{highPriorityCount}</p>
                        </button>
                    </CardContent>
                </Card>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold">Execution Queue</h3>
                    <div className="mt-3 space-y-2">
                        {actionQueue.map((task) => (
                            <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <span className="text-[11px] text-blue-300">{task.due}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{task.reason}</p>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="outline" className="text-[10px] border-white/15">
                                            Urgency: {task.journey.urgencyScore}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] border-white/15">
                                            Stage: {task.journey.stage}
                                        </Badge>
                                        {task.journey.primaryMetrics.slice(0, 1).map((metric) => (
                                            <Badge key={`${task.id}-${metric.label}`} variant="outline" className="text-[10px] border-white/15">
                                                {metric.label}: {metric.value}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-xs shrink-0"
                                        onClick={() =>
                                            handleExploreDetail({
                                                key: "weekly_plan",
                                                title: task.title,
                                                summary: task.reason,
                                                intentType: task.journey.intentType,
                                                listingId: task.journey.propertyId,
                                            })
                                        }
                                    >
                                        Start
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Journey & Deal Timeline</h3>
                        <Badge variant="outline" className="border-white/20 text-[10px]">Live</Badge>
                    </div>
                    <div className="mt-3 space-y-3">
                        {snapshot.prioritizedJourneys.slice(0, 4).map((journey, index) => (
                            <div key={`timeline-${journey.id}`} className="w-full flex items-start gap-3 group">
                                <button
                                    type="button"
                                    className="mt-0.5 flex flex-col items-center"
                                    onClick={() =>
                                        handleExploreDetail({
                                            key: "journey_tracker",
                                            title: journey.label,
                                            summary: `${INTENT_LABEL[journey.intentType]} lane in "${journey.stage}" stage.`,
                                            intentType: journey.intentType,
                                            listingId: journey.propertyId,
                                        })
                                    }
                                >
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-400 group-hover:scale-110 transition-transform" />
                                    {index < 3 ? <div className="h-12 w-px bg-white/20 mt-1" /> : null}
                                </button>
                                <div className="flex-1 rounded-lg border border-slate-200 bg-white p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium">{journey.label}</p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 px-2 text-xs"
                                            onClick={() =>
                                                handleExploreDetail({
                                                    key: "deal_room",
                                                    title: journey.label,
                                                    summary: "Review documents, deadlines, and collaboration history for this journey.",
                                                    intentType: journey.intentType,
                                                    listingId: journey.propertyId,
                                                })
                                            }
                                        >
                                            Open Deal
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {INTENT_LABEL[journey.intentType]} • {journey.stage} • urgency {journey.urgencyScore}
                                    </p>
                                    <p className="text-xs text-blue-300 mt-1">
                                        Next checkpoint: {journey.nextDueDate ? new Date(journey.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold">Financial Clarity</h3>
                    <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <span className="text-muted-foreground">Capital Surface (Buy + Sell)</span>
                            <span className="font-semibold">{formatCompactCurrency(financialSurface)}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <span className="text-muted-foreground">Potential Purchase Volume</span>
                            <span className="font-semibold">{formatCompactCurrency(snapshot.totals.potentialPurchaseVolume)}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <span className="text-muted-foreground">Potential Sale Proceeds</span>
                            <span className="font-semibold">{formatCompactCurrency(snapshot.totals.potentialSaleProceeds)}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <span className="text-muted-foreground">Net Monthly Rent</span>
                            <span className="font-semibold">{formatCompactCurrency(snapshot.totals.monthlyRentIn - snapshot.totals.monthlyRentOut)}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
