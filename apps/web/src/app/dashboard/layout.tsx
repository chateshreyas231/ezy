"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIChatOverlay } from "@/components/dashboard/ai-chat-overlay";
import { cn } from "@/lib/utils";
import {
    Compass,
    Handshake,
    LayoutDashboard,
    Menu,
    PanelLeft,
    PanelLeftClose,
    Search,
    Sparkles,
    Target,
    Users,
    X
} from "lucide-react";

const sidebarItems = [
    { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/listings", label: "My Listings", icon: Handshake },
    { href: "/dashboard/plans", label: "Buying Plans", icon: Target },
    { href: "/dashboard/market", label: "Explore Listings", icon: Compass },
    { href: "/dashboard/network", label: "Agents & Vendors", icon: Users }
] as const;

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const openHandler = () => setIsChatOpen(true);
        window.addEventListener("ezriya:open-ai-chat", openHandler);
        return () => window.removeEventListener("ezriya:open-ai-chat", openHandler);
    }, []);

    const pageTitle = useMemo(() => {
        const active = sidebarItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
        return active?.label ?? "Overview";
    }, [pathname]);

    return (
        <DottedSurface className="min-h-screen pt-20 pb-12 px-4 md:px-6">
            <AIChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[auto_1fr]">
                <aside className={cn("hidden lg:block sticky top-24 h-[calc(100vh-7rem)]", isCollapsed ? "w-[76px]" : "w-[250px]")}>
                    <Card className="bg-white/5 border-white/10 h-full flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                                {!isCollapsed && (
                                    <div>
                                        <CardTitle className="text-base">Dashboard Menu</CardTitle>
                                        <CardDescription>Open what you need now.</CardDescription>
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setIsCollapsed((prev) => !prev)}
                                >
                                    {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 flex-1 overflow-y-auto">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                const Icon = item.icon;

                                return (
                                    <Button
                                        key={item.href}
                                        variant={isActive ? "default" : "ghost"}
                                        asChild
                                        className={cn("w-full", isCollapsed ? "justify-center" : "justify-start gap-2")}
                                    >
                                        <Link href={item.href}>
                                            <Icon className="h-4 w-4" />
                                            {!isCollapsed && item.label}
                                        </Link>
                                    </Button>
                                );
                            })}

                            <div className="pt-2 border-t border-white/10 space-y-2">
                                <Button asChild variant="outline" className={cn("w-full", isCollapsed ? "justify-center" : "justify-start gap-2")}>
                                    <Link href="/explore/agent">
                                        <Users className="h-4 w-4" />
                                        {!isCollapsed && "Explore Agents"}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className={cn("w-full", isCollapsed ? "justify-center" : "justify-start gap-2")}>
                                    <Link href="/explore/vendor">
                                        <Search className="h-4 w-4" />
                                        {!isCollapsed && "Explore Vendors"}
                                    </Link>
                                </Button>
                                <Button
                                    onClick={() => setIsChatOpen(true)}
                                    className={cn("w-full", isCollapsed ? "justify-center" : "justify-start gap-2")}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {!isCollapsed && "Open Assistant"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-3 lg:hidden">
                        <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="h-4 w-4" />
                        </Button>
                        <p className="font-medium">{pageTitle}</p>
                        <Button variant="outline" size="icon" onClick={() => setIsChatOpen(true)}>
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Client Workspace</p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manage every step of your transaction in one place.</h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl">
                            Navigate instantly between deal progress, listings, action items, agents, vendors, and market discovery.
                        </p>
                    </div>

                    {children}
                </div>
            </div>

            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        className="absolute inset-0 bg-black/60"
                        aria-label="Close menu"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-[290px] bg-background border-r border-white/10 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Client Dashboard</p>
                                <p className="font-semibold">Navigation</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                const Icon = item.icon;

                                return (
                                    <Button
                                        key={item.href}
                                        variant={isActive ? "default" : "ghost"}
                                        asChild
                                        className="w-full justify-start gap-2"
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        <Link href={item.href}>
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                            <Button asChild variant="outline" className="w-full justify-start gap-2" onClick={() => setIsMobileOpen(false)}>
                                <Link href="/explore/agent">
                                    <Users className="h-4 w-4" /> Explore Agents
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start gap-2" onClick={() => setIsMobileOpen(false)}>
                                <Link href="/explore/vendor">
                                    <Search className="h-4 w-4" /> Explore Vendors
                                </Link>
                            </Button>
                            <Button
                                className="w-full justify-start gap-2"
                                onClick={() => {
                                    setIsMobileOpen(false);
                                    setIsChatOpen(true);
                                }}
                            >
                                <Sparkles className="h-4 w-4" /> Open Assistant
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DottedSurface>
    );
}
