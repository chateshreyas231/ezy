"use client";

import AgentExploreView from "@/components/agent-explore-view";
import { DottedSurface } from "@/components/ui/dotted-surface";

export default function AgentPage() {
  return (
    <DottedSurface className="min-h-screen pt-16">
      <AgentExploreView />
    </DottedSurface>
  );
}
