"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import PromptInputDynamicGrow from "@/components/ui/prompt-input-dynamic-grow";
import { MessageCircle, X } from "lucide-react";

type ChatbotFabProps = {
  title: string;
  placeholder: string;
};

export default function ChatbotFab({ title, placeholder }: ChatbotFabProps) {
  const [open, setOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[22rem] rounded-2xl border border-primary/25 bg-background/95 p-3 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{title}</p>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close chatbot">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <PromptInputDynamicGrow
            placeholder={placeholder}
            onSubmit={(value) => setLastPrompt(value)}
          />
          {lastPrompt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last request: <span className="font-medium text-foreground">{lastPrompt}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-[0_16px_28px_rgba(0,0,0,0.25)]"
          onClick={() => setOpen(true)}
          aria-label="Open chatbot"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

