"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";
import { EthicalHero } from "@/components/ui/hero-5";
import PromptInputDynamicGrow from "@/components/ui/prompt-input-dynamic-grow";
import { useMemo, useState } from "react";

const roles = [
    {
        id: "client",
        title: "Client Portal",
        description: "Unified dashboard for buying, selling, and managing your real estate journey.",
        href: "/dashboard",
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=900&auto=format&fit=crop",
    },
    {
        id: "agent",
        title: "Agent Dashboard",
        description: "Manage listings, view analytics, and showcase your portfolio.",
        href: "/explore/agent",
        imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=900&auto=format&fit=crop",
    },
    {
        id: "broker",
        title: "Broker Organization",
        description: "Oversee your team, track market performance, and manage client relations.",
        href: "/explore/broker",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop",
    },
    {
        id: "vendor",
        title: "Vendor Network",
        description: "Connect with agents and clients, offer services, and grow your business.",
        href: "/explore/vendor",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=900&auto=format&fit=crop",
    }
];

export default function ExplorePage() {
    const [aiQuery, setAiQuery] = useState("");

    const features = useMemo(() => {
        const normalized = aiQuery.trim().toLowerCase();
        return roles
            .filter((role) => {
                if (!normalized) return true;
                return `${role.title} ${role.description}`.toLowerCase().includes(normalized);
            })
            .map((role) => ({
                id: role.id,
                title: role.title,
                imageUrl: role.imageUrl,
                href: role.href,
            }));
    }, [aiQuery]);

    return (
        <DottedSurface className="min-h-screen pt-24 pb-10 px-4 md:px-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
                <EthicalHero
                    title={
                        <>
                            Explore every role in{" "}
                            <span className="text-primary">Ezriya</span>
                            <br />
                            from one intelligent hub.
                        </>
                    }
                    subtitle="Navigate client, agent, broker, and vendor workflows with a clean role-based view and transition into each portal in one click."
                    ctaLabel="Open Client Portal"
                    ctaHref="/dashboard"
                    features={features}
                    topContent={
                        <PromptInputDynamicGrow
                            placeholder="Tell us what you need: agents in Miami, broker with luxury focus, vendor for staging..."
                            onSubmit={(value) => setAiQuery(value)}
                        />
                    }
                />
            </div>
        </DottedSurface>
    );
}
