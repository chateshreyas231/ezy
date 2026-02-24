"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWorkspaceAiStore } from "@/lib/workspace-ai-store";
import {
    Compass,
    Handshake,
    LayoutDashboard,
    Menu,
    PanelLeft,
    PanelLeftClose,
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
    const { conversationSessions } = useWorkspaceAiStore();

    const pageTitle = useMemo(() => {
        const active = sidebarItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
        return active?.label ?? "Overview";
    }, [pathname]);

    return (
        <DottedSurface className="min-h-screen pt-20 pb-3 md:pb-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[auto_1fr]">
                <aside className={cn("hidden lg:block sticky top-24 h-[calc(100vh-7rem)]", isCollapsed ? "w-[76px]" : "w-[250px]")}>
                    <Card className="bg-sidebar border-sidebar-border h-full flex flex-col">
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

                            {!isCollapsed ? (
                                <div className="pt-3 mt-3 border-t border-sidebar-border">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Conversation History</p>
                                    <div className="space-y-1.5">
                                        {conversationSessions.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">No logs yet. Start in AI Workspace Live.</p>
                                        ) : (
                                            conversationSessions.slice(0, 8).map((session) => {
                                                const titleStr = session.title || (session.messages.length > 0 ? session.messages[0].content : "Empty Session");
                                                return (
                                                    <Link
                                                        key={session.id}
                                                        href={`/dashboard/overview?historyId=${session.id}`}
                                                        className="block rounded-md border border-sidebar-border px-2 py-1.5 hover:bg-accent/40 transition-colors"
                                                    >
                                                        <p className="text-[10px] uppercase text-muted-foreground">AI Session</p>
                                                        <p className="text-xs leading-4 line-clamp-2">{titleStr}</p>
                                                    </Link>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </aside>

                <div className="flex flex-col lg:space-y-6 h-[calc(100dvh-5rem)] pb-3 lg:pb-0 lg:h-auto">
                    <div className="fixed top-4 left-4 lg:hidden z-50 pointer-events-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-full h-10 w-10 text-slate-700"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="hidden lg:block shrink-0">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Client Workspace</p>
                        <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
                    </div>

                    <div className="flex-1 min-h-0">
                        {children}
                    </div>
                </div>
            </div>

            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        className="absolute inset-0 bg-black/60"
                        aria-label="Close menu"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-[290px] bg-background border-r border-border p-4">
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

                        <div className="pt-3 mt-3 border-t border-border">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Conversation History</p>
                            <div className="space-y-1.5">
                                {conversationSessions.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No logs yet.</p>
                                ) : (
                                    conversationSessions.slice(0, 5).map((session) => {
                                        const titleStr = session.title || (session.messages.length > 0 ? session.messages[0].content : "Empty Session");
                                        return (
                                            <Link
                                                key={session.id}
                                                href={`/dashboard/overview?historyId=${session.id}`}
                                                onClick={() => setIsMobileOpen(false)}
                                                className="block rounded-md border border-border px-2 py-1.5 hover:bg-accent/40 transition-colors"
                                            >
                                                <p className="text-[10px] uppercase text-muted-foreground">AI Session</p>
                                                <p className="text-xs leading-4 line-clamp-2">{titleStr}</p>
                                            </Link>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </DottedSurface>
    );
}
