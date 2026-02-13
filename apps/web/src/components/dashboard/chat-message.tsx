"use client";

import { cn } from "@/lib/utils";
import { Sparkles, CopyIcon, RefreshCcwIcon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon, User } from "lucide-react";
import { motion } from "framer-motion";
import { Action, Actions } from "@/components/ui/actions";

interface ChatMessageProps {
    role: "user" | "ai";
    content: React.ReactNode;
    timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
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
                "flex gap-3 max-w-[85%]",
                isAI ? "self-start" : "self-end flex-row-reverse"
            )}
        >
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                isAI
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            )}>
                {isAI ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>

            <div className={cn(
                "rounded-2xl p-4 text-sm leading-relaxed",
                isAI
                    ? "bg-white/5 border border-white/10 rounded-tl-none"
                    : "bg-primary border border-primary/30 text-primary-foreground rounded-tr-none"
            )}>
                {content}
                {isAI && (
                    <Actions className="mt-2">
                        {messageActions.map((action) => (
                            <Action key={action.label} label={action.label}>
                                <action.icon className="size-4" />
                            </Action>
                        ))}
                    </Actions>
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
