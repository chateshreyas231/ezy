"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();
    const isLanding = pathname === "/";

    const roleLinks = [
        { label: "Client", href: "/dashboard/overview" },
        { label: "Agent", href: "/explore/agent" },
        { label: "Directory", href: "/explore/broker" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <nav className="pointer-events-auto flex items-center gap-1 p-1 bg-white/45 backdrop-blur-xl border border-black/10 rounded-full shadow-[0_14px_32px_rgba(0,0,0,0.12)]">

                {/* Logo Icon Home Link */}
                <Link href="/" className="px-4 py-2 font-bold text-lg tracking-tighter hover:opacity-80 transition-opacity">
                    Ezriya
                </Link>

                <div className="w-px h-6 bg-border/40 mx-1" />

                {!isLanding && (
                    <div className="hidden md:flex items-center gap-1 px-1">
                        {roleLinks.map((role) => {
                            const isActive = pathname === role.href || pathname.startsWith(`${role.href}/`);
                            return (
                                <Button
                                    key={role.href}
                                    size="sm"
                                    variant={isActive ? "default" : "ghost"}
                                    className={cn("rounded-full px-3", isActive ? "" : "text-muted-foreground")}
                                    asChild
                                >
                                    <Link href={role.href}>{role.label}</Link>
                                </Button>
                            );
                        })}
                    </div>
                )}

                {isLanding && (
                    <Button size="sm" variant="ghost" className="rounded-full px-4" asChild>
                        <Link href="/explore">Explore Platform</Link>
                    </Button>
                )}
            </nav>
        </header>
    );
}
