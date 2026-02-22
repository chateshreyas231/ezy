"use client";

import { ArrowRight, Globe, Sparkles } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIInputWithSearchProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string, withSearch: boolean) => void;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export function AIInputWithSearch({
  id = "ai-input-with-search",
  placeholder = "Ask anything...",
  minHeight: _minHeight = 48,
  maxHeight: _maxHeight = 164,
  onSubmit,
  onFileSelect: _onFileSelect,
  className,
}: AIInputWithSearchProps) {
  void _minHeight;
  void _maxHeight;
  void _onFileSelect;
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSearch, setShowSearch] = useState(true);

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (value.trim()) {
      onSubmit?.(value, showSearch);
      setValue("");
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto transition-all duration-500 ease-in-out py-2", className)}>
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={cn(
            "relative flex items-center bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden",
            isFocused ? "ring-2 ring-primary/30 border-primary/50" : "hover:border-primary/40",
          )}
        >
          <div className="pl-4 text-primary/60">
            <Sparkles className="w-5 h-5" />
          </div>

          <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 120)}
            placeholder={placeholder}
            className="border-0 bg-transparent py-6 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
          />

          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            className={cn(
              "mr-1 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors",
              showSearch
                ? "border-sky-400/60 bg-sky-500/15 text-sky-400"
                : "border-transparent bg-muted/30 text-muted-foreground hover:text-foreground",
            )}
            aria-label={showSearch ? "Disable web search" : "Enable web search"}
            title={showSearch ? "Web search enabled" : "Web search disabled"}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>

          <div className="pr-2">
            <Button
              size="icon"
              type="submit"
              disabled={!value.trim()}
              className={cn(
                "rounded-xl transition-all duration-300",
                value.trim() ? "bg-primary text-primary-foreground opacity-100 scale-100" : "opacity-0 scale-75 w-0 p-0 overflow-hidden",
              )}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
