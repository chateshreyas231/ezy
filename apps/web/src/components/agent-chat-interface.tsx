import React, { useState, useRef } from 'react';
import { Sparkles, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentChatInterfaceProps {
    onSearch: (query: string) => void;
    className?: string;
    isExpanded?: boolean;
}

const SUGGESTIONS = [
    "Find agents in Miami",
    "Agents with condo experience",
    "Who lists historic homes?",
    "Commercial real estate participants"
];

const AgentChatInterface: React.FC<AgentChatInterfaceProps> = ({
    onSearch,
    className,
    isExpanded = false
}) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;
        onSearch(query);
    };

    return (
        <div className={cn("w-full max-w-2xl mx-auto transition-all duration-500 ease-in-out", className)}>
            <form onSubmit={handleSubmit} className="relative group">
                <div className={cn(
                    "relative flex items-center bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden",
                    isFocused ? "ring-2 ring-primary/30 border-primary/50" : "hover:border-primary/40"
                )}>
                    <div className="pl-4 text-primary/60">
                        <Sparkles className="w-5 h-5" />
                    </div>

                    <Input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="Ask for agent directory information..."
                        className="chat-bar-control border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                    />

                    <div className="pr-2">
                        <Button
                            size="icon"
                            type="submit"
                            disabled={!query.trim()}
                            className={cn(
                                "rounded-xl transition-all duration-300",
                                query.trim() ? "bg-primary text-primary-foreground opacity-100 scale-100" : "opacity-0 scale-75 w-0 p-0 overflow-hidden"
                            )}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Suggestions - Only show when focused and expanded/default view */}
                <AnimatePresence>
                    {isFocused && !query && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-3 p-2 bg-background/90 backdrop-blur-md border border-primary/10 rounded-xl shadow-xl z-20"
                        >
                            <div className="text-xs font-medium text-muted-foreground uppercase px-2 mb-2">Suggested</div>
                            <div className="grid gap-1">
                                {SUGGESTIONS.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setQuery(suggestion);
                                            onSearch(suggestion);
                                        }}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 text-left text-sm transition-colors group/item"
                                    >
                                        <div className="p-1.5 rounded-full bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                            <Search className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {!isFocused && !isExpanded && (
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    <div className="text-sm text-muted-foreground mr-2 py-1">Try asking:</div>
                    {["Miami agents", "Condo focus", "Commercial"].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => {
                                setQuery(tag);
                                onSearch(tag);
                            }}
                            className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs hover:bg-primary/10 hover:border-primary/30 transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgentChatInterface;
