"use client";

import { cn } from "@/lib/utils";
import { Sparkles, CopyIcon, RefreshCcwIcon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon, User } from "lucide-react";
import { motion } from "framer-motion";
import { Action, Actions } from "@/components/ui/actions";

import { TextEffect } from "@/components/ui/text-effect";

interface ChatMessageProps {
    role: "user" | "ai";
    content: React.ReactNode;
    timestamp?: string;
    showActions?: boolean;
}

export function ChatMessage({ role, content, timestamp, showActions }: ChatMessageProps) {
    const isAI = role === "ai";
    const messageActions = [
        { icon: RefreshCcwIcon, label: "Retry" },
        { icon: ThumbsUpIcon, label: "Like" },
        { icon: ThumbsDownIcon, label: "Dislike" },
        { icon: CopyIcon, label: "Copy" },
        { icon: ShareIcon, label: "Share" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex max-w-[100%] sm:max-w-[90%] outline-none focus:outline-none",
                isAI ? "self-start -ml-3 sm:-ml-4" : "self-end flex-row-reverse gap-2 sm:gap-3"
            )}
        >
            <div
                tabIndex={isAI ? 0 : undefined}
                className={cn(
                    "group rounded-2xl p-3 sm:p-4 text-sm leading-snug whitespace-pre-wrap outline-none focus:outline-none",
                    isAI
                        ? "bg-white/5 border border-white/10 border-l-0 text-foreground rounded-l-none"
                        : "bg-primary border border-primary/30 text-primary-foreground rounded-tr-none"
                )}>
                {isAI && typeof content === "string" ? (
                    <TextEffect per="word" preset="fade">
                        {content}
                    </TextEffect>
                ) : (
                    content
                )}
                {showActions && isAI && (
                    <div className="opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100 focus-within:opacity-100 group-hover:pointer-events-auto group-focus:pointer-events-auto focus-within:pointer-events-auto">
                        <Actions className="mt-2">
                            {messageActions.map((action) => (
                                <Action key={action.label} label={action.label}>
                                    <action.icon className="size-4" />
                                </Action>
                            ))}
                        </Actions>
                    </div>
                )}
                {timestamp && (
                    <div className="text-[10px] opacity-50 mt-1 text-right">
                        {timestamp}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
