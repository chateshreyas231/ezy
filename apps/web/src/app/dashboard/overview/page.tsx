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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    CalendarClock,
    Compass,
    Handshake,
    Mic,
    Send,
    Sparkles,
    Volume2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    saveConversationSession,
    appendBuyingPlan,
    appendSellerListing,
    readWorkspaceAiStore,
    type ConversationSessionRecord,
    type ChatMessageRecord
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
    const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);
    const sessionIdRef = useRef(sessionId);
    const messagesRef = useRef<WorkspaceMessage[]>(messages);
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const searchParams = useSearchParams();
    const historyId = searchParams.get("historyId");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load history when clicked from sidebar
    useEffect(() => {
        if (historyId && mounted) {
            const store = readWorkspaceAiStore();
            const session = store.conversationSessions.find((s: ConversationSessionRecord) => s.id === historyId);
            if (session) {
                setSessionId(session.id);
                sessionIdRef.current = session.id;
                setMessages(session.messages);
                messagesRef.current = session.messages;
            }
        }
    }, [historyId, mounted]);

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
        const nextMessages = [...messagesRef.current, { role, content }];
        messagesRef.current = nextMessages;
        setMessages(nextMessages);

        if (persist) {
            saveConversationSession({
                id: sessionIdRef.current,
                messages: nextMessages,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                title: nextMessages.find(m => m.role === "user")?.content || nextMessages[0]?.content || "AI Session"
            });
        }
    }

    function handleExploreDetail(detail: ClientDetailSelection) {
        inputRef.current?.focus();
        addWorkspaceMessage("ai", toContextMessage(detail));
    }

    function startBuyIntentFlow() {
        addWorkspaceMessage("user", "Start Buy Intent");
        setTimeout(() => {
            addWorkspaceMessage("ai", `Starting buyer intent creation. Great. Which city/area are you targeting?`);
            setAssistantFlow({
                kind: "buy",
                step: 0,
                answers: [],
                awaitingConfirmation: false,
                summary: "",
            });
            // Assuming setIsLoading is defined elsewhere or removed if not needed
            // setIsLoading(false);
        }, 300);
    }

    function startSellIntentFlow() {
        addWorkspaceMessage("user", "Start Sell Listing");
        setTimeout(() => {
            addWorkspaceMessage("ai", `Starting seller listing creation. What is the address of the property?`);
            setAssistantFlow({
                kind: "sell",
                step: 0,
                answers: [],
                awaitingConfirmation: false,
                summary: "",
            });
            // Assuming setIsLoading is defined elsewhere or removed if not needed
            // setIsLoading(false);
        }, 300);
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

    const sidebarContent = (
        <div className="space-y-4 pb-8 lg:pb-0">

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
    );

    if (!mounted) {
        return (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_420px] xl:h-[calc(100vh-12rem)]">
                <div className="rounded-xl border border-slate-200 bg-white min-h-[600px]" />
                <div className="rounded-xl border border-slate-200 bg-white min-h-[600px]" />
            </div>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_420px] h-full lg:h-[calc(100vh-12rem)] lg:overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
                <Card className="border-slate-200 bg-white h-full flex flex-col overflow-hidden">
                    <CardHeader className="pb-3 shrink-0">
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-xl">AI Workspace Live</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs px-2"
                                    onClick={() => {
                                        const newSessionId = `session-${Date.now()}`;
                                        setSessionId(newSessionId);
                                        sessionIdRef.current = newSessionId;
                                        const newMsgs: WorkspaceMessage[] = [{ role: "ai", content: "Chat cleared. I am live in your workspace. How can I help?" }];
                                        setMessages(newMsgs);
                                        messagesRef.current = newMsgs;
                                    }}
                                >
                                    New Chat
                                </Button>
                                <Badge variant="outline" className="border-white/20 hidden sm:flex">
                                    {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
                                </Badge>
                                <div className="lg:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-6 text-xs px-2">Overview</Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto pt-10 pb-6 bg-slate-50/50 backdrop-blur-xl">
                                            <SheetHeader className="mb-4 text-left">
                                                <SheetTitle>Workspace Overview</SheetTitle>
                                            </SheetHeader>
                                            {sidebarContent}
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="gap-2 sm:gap-4 flex-1 min-h-[0] flex flex-col px-3 sm:px-6 pb-3 sm:pb-6 pt-0 overflow-hidden">
                        <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-6 rounded-xl border border-slate-200 bg-white p-3 md:p-5 shrink-0">
                            <div className="relative shrink-0 flex items-center justify-center w-[50px] h-[50px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]">
                                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl sm:blur-2xl" />
                                <div className="relative rounded-full border border-slate-200 bg-white p-1 sm:p-2 flex items-center justify-center w-full h-full overflow-hidden">
                                    <div className="scale-[0.4] sm:scale-[0.8] md:scale-100 flex items-center justify-center origin-center">
                                        <SiriOrb size="110px" animationDuration={14} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 text-left sm:text-center md:text-left mt-0">
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-blue-300">
                                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    <span className="hidden min-[400px]:inline">Conversation-First Client Workspace</span>
                                    <span className="min-[400px]:hidden">Workspace Live</span>
                                </div>
                                <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground leading-snug sm:leading-normal line-clamp-2 sm:line-clamp-none">
                                    This workspace helps organize buyer intents and seller listings, collect required media/questions, and save details for review.
                                </p>
                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                                    User controls all decisions.
                                </p>
                                <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2 justify-start sm:justify-center md:justify-start">
                                    <Button size="sm" onClick={startBuyIntentFlow} className="h-7 text-[10px] sm:h-9 sm:text-sm px-2.5 sm:px-4">
                                        Start Buy Intent
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={startSellIntentFlow} className="h-7 text-[10px] sm:h-9 sm:text-sm px-2.5 sm:px-4">
                                        Start Sell Listing
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 sm:p-4 min-h-[100px] sm:min-h-[150px]">
                            <div className="flex flex-col gap-2">
                                {messages.map((message, index) => {
                                    const isLastAiMessage = message.role === "ai" &&
                                        index === messages.map(m => m.role).lastIndexOf("ai");
                                    return (
                                        <ChatMessage
                                            key={`${message.role}-${index}`}
                                            role={message.role}
                                            content={message.content}
                                            showActions={isLastAiMessage}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <form
                            className="flex gap-1.5 sm:gap-2 shrink-0"
                            onSubmit={(event) => {
                                event.preventDefault();
                                sendMessage();
                            }}
                        >
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Message AI Assistant..."
                                className="chat-bar-control"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={startVoiceInput} className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                                <Mic className={`h-4 w-4 sm:h-4 sm:w-4 ${isListening ? "text-blue-400" : ""}`} />
                            </Button>
                            <Button type="submit" size="icon" className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                                <Send className="h-4 w-4 sm:h-4 sm:w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="hidden lg:block lg:h-full lg:overflow-y-auto lg:pr-1">
                {sidebarContent}
            </div>
        </div>
    );
}
