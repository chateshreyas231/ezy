"use client";

import { useMemo, useState } from "react";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { Badge } from "@/components/ui/badge";
import { InteractiveTravelCard } from "@/components/ui/3d-card";
import { DottedSurface } from "@/components/ui/dotted-surface";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const routeCards = [
  {
    title: "Client Workspace",
    subtitle: "Dashboards, journeys, and deal progress",
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3",
    actionText: "Open Client",
    href: "/dashboard/overview",
  },
  {
    title: "Agent Explore",
    subtitle: "Network insights and agent profiles",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    actionText: "Open Agent",
    href: "/explore/agent",
  },
  {
    title: "Directory",
    subtitle: "Brokers and vendors in one directory",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    actionText: "Open Directory",
    href: "/explore/broker",
  },
] as const;

function routeSuggestion(query: string) {
  const input = query.toLowerCase();
  if (input.includes("client") || input.includes("dashboard")) return "/dashboard/overview";
  if (input.includes("agent")) return "/explore/agent";
  if (input.includes("broker") || input.includes("vendor") || input.includes("directory")) return "/explore/broker";
  return "";
}

export default function ExplorePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const latestSuggestion = useMemo(() => {
    const userMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
    return routeSuggestion(userMessage);
  }, [messages]);

  return (
    <DottedSurface className="pt-28 pb-12 px-4 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3 text-center">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Explore Platform
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">Pick your workspace</h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
            Chat with AI to describe what you need, then jump into Client, Agent, or Directory.
          </p>
        </header>

        <section className="flex flex-wrap items-center justify-center gap-6" aria-label="Explore route cards">
          {routeCards.map((card) => (
            <div key={card.href} style={{ perspective: "1000px" }}>
              <InteractiveTravelCard
                title={card.title}
                subtitle={card.subtitle}
                imageUrl={card.imageUrl}
                actionText={card.actionText}
                href={card.href}
                onActionClick={() => window.location.assign(card.href)}
                onCardClick={() => window.location.assign(card.href)}
              />
            </div>
          ))}
        </section>

        <div className="mx-auto w-full max-w-3xl pt-2">
          <AIInputWithSearch
            placeholder="Example: I need broker options in Miami, or open my client dashboard."
            onSubmit={(value) => {
              const suggestion = routeSuggestion(value);
              const assistantMessage = suggestion
                ? `Best match: ${suggestion}. Use the cards below to open it.`
                : "I could not match that cleanly. Use the cards below to choose Client, Agent, or Directory.";

              setMessages((current) => [
                ...current,
                { role: "user", content: value },
                { role: "assistant", content: assistantMessage },
              ]);
            }}
            onFileSelect={() => {}}
          />
          {latestSuggestion ? (
            <p className="mt-2 text-center text-xs text-emerald-400">
              Suggested route from your latest message: {latestSuggestion}
            </p>
          ) : null}
        </div>
      </div>
    </DottedSurface>
  );
}
