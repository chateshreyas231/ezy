"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Home, DollarSign, Building, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./chat-message";
import { motion, AnimatePresence } from "framer-motion";
import { SiriOrb } from "@/components/ui/siri-orb";

interface AIChatOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

type ChatStep = "GREETING" | "INTENT_SELECTION" | "DETAILS" | "ANALYSIS" | "PREVIEW" | "PAYMENT" | "COMPLETED";
type ChatEntry = {
    role: "user" | "ai";
    content: React.ReactNode;
    timestamp: string;
};

export function AIChatOverlay({ isOpen, onClose }: AIChatOverlayProps) {
    const [messages, setMessages] = useState<ChatEntry[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [currentStep, setCurrentStep] = useState<ChatStep>("GREETING");
    const [isLoading, setIsLoading] = useState(false);
    const [intent, setIntent] = useState<"buy" | "sell" | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                setIsLoading(true);
                setMessages([
                    {
                        role: "ai",
                        content: (
                            <div className="space-y-4">
                                <p>Hello, I&apos;m the Ezriya assistant. I can help you organize your real estate journey.</p>
                                <p>What would you like to work on today?</p>
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        className="justify-start gap-2 bg-white/5 hover:bg-white/10"
                                        onClick={() => handleIntentSelect("sell")}
                                    >
                                        <Home className="h-4 w-4 text-white" />
                                        I want to prepare a listing (Sell)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start gap-2 bg-white/5 hover:bg-white/10"
                                        onClick={() => handleIntentSelect("buy")}
                                    >
                                        <Search className="h-4 w-4 text-blue-400" />
                                        I&apos;m looking for properties (Buy)
                                    </Button>
                                </div>
                            </div>
                        ),
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                ]);
                setIsLoading(false);
            }, 800);
        }
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleIntentSelect = (selectedIntent: "buy" | "sell") => {
        setIntent(selectedIntent);
        addMessage("user", selectedIntent === "sell" ? "I want to sell my property." : "I'm looking to buy a property.");

        setIsLoading(true);
        setTimeout(() => {
            setCurrentStep("DETAILS");
            const prompt = selectedIntent === "sell"
                ? "Great. Let's prepare your listing. What is the address or general location of the property?"
                : "Great. To narrow options, where are you planning to buy?";
            addMessage("ai", prompt);
            setIsLoading(false);
        }, 1000);
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue("");
        addMessage("user", userMsg);
        setIsLoading(true);

        // Simple State Machine for Demo
        setTimeout(() => {
            processAIResponse(userMsg);
        }, 1500);
    };

    const processAIResponse = (lastInput: string) => {
        if (currentStep === "DETAILS") {
            setCurrentStep("ANALYSIS");
            addMessage("ai", `Got it. I am reviewing market activity in ${intent === "sell" ? "that area" : "your target location"}...`);

            setTimeout(() => {
                const nextPrompt = intent === "sell"
                    ? "Based on recent sales, what is your target listing price? (e.g., $1.2M)"
                    : "What is your budget range? (e.g., $800k - $1M)";
                addMessage("ai", nextPrompt, true);
                setCurrentStep("PREVIEW");
            }, 2000);
            return;
        }

        if (currentStep === "PREVIEW") {
            const isSell = intent === "sell";
            const previewContent = (
                <div className="space-y-4">
                    <p>I&apos;ve prepared a {isSell ? "listing draft" : "buying intent"} for your review based on our conversation.</p>

                    {/* Mock Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSell ? "bg-white/10 text-white" : "bg-blue-500/20 text-blue-400"}`}>
                                {isSell ? <Building className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </div>
                            <div>
                                <h4 className="font-semibold">{isSell ? "Modern Property Draft" : "Strategic Purchase Intent"}</h4>
                                <p className="text-xs text-muted-foreground">Based on your input</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white/5 p-2 rounded">
                                <span className="text-muted-foreground block">Price/Budget</span>
                                <span className="font-mono">{lastInput}</span>
                            </div>
                            <div className="bg-white/5 p-2 rounded">
                                <span className="text-muted-foreground block">Confidence</span>
                                <span className="text-green-400 font-bold">94% Match</span>
                            </div>
                        </div>
                    </div>

                    <p>To finalize this and connect with qualified specialists in this price range, a verification fee applies.</p>

                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-semibold">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay $50 & Start {isSell ? "Listing Process" : "Intent"}
                    </Button>
                </div>
            );

            addMessage("ai", previewContent);
            setCurrentStep("PAYMENT");
            setIsLoading(false);
            return;
        }

        if (currentStep === "PAYMENT") {
            addMessage("ai", "Please click the button above to continue to the secure payment link.");
            setIsLoading(false);
        }
    };

    const addMessage = (role: "user" | "ai", content: React.ReactNode, keepLoading = false) => {
        setMessages(prev => [...prev, {
            role,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        if (!keepLoading) setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-2xl h-[80vh] bg-background/95 border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 px-6">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full border border-white/30 flex items-center justify-center relative z-10 overflow-hidden bg-background">
                                    <SiriOrb size="40px" animationDuration={15} />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Ezriya Assistant</h3>
                                <div className="flex items-center gap-2 text-xs text-green-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Available
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto relative bg-background/60 scrollbar-none" ref={scrollRef}>
                        <div className="h-full px-6 py-6">
                            <div className="flex flex-col gap-6 pb-4">
                                {messages.map((msg, i) => (
                                    <ChatMessage
                                        key={i}
                                        role={msg.role}
                                        content={msg.content}
                                        timestamp={msg.timestamp}
                                    />
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-3 self-start max-w-[80%]"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
                                            <SiriOrb size="28px" animationDuration={12} />
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="flex gap-2 relative"
                        >
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="bg-background/70 border-white/10 focus-visible:ring-white/50 pr-12 py-6"
                                disabled={currentStep === "GREETING" || isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 h-[calc(100%-8px)] w-10 bg-white hover:bg-white/90 text-black rounded-md transition-colors"
                                disabled={!inputValue.trim() || isLoading}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
