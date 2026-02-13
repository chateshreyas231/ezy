import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Briefcase, Building2, LayoutDashboard, TrendingUp } from "lucide-react";

interface PlatformHighlightsProps {
  className?: string;
  compact?: boolean;
  showAgentCard?: boolean;
  centered?: boolean;
}

export function PlatformHighlights({
  className,
  compact = false,
  showAgentCard = true,
  centered = false,
}: PlatformHighlightsProps) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      <div
        className={cn(
          compact
            ? "flex gap-3 overflow-x-auto pb-1"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        )}
      >
        <div className={cn("group relative overflow-hidden rounded-3xl border border-blue-400/25 bg-gradient-to-br from-background via-blue-500/10 to-background/90 backdrop-blur-xl shadow-[0_10px_28px_rgba(37,99,235,0.14)] transition-all hover:border-blue-300/45 hover:shadow-[0_14px_34px_rgba(37,99,235,0.2)] flex flex-col", compact ? "min-w-[260px] p-4" : "p-6")}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

          <div className={cn("relative z-10 flex flex-col h-full gap-4", centered && "items-center text-center")}>
            <div className={cn("flex items-center", centered ? "justify-center gap-2" : "justify-between")}>
              <div className={cn("bg-blue-500/10 w-fit rounded-xl text-blue-400", compact ? "p-2" : "p-3", centered && "mx-auto")}>
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
                Active Listing
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className={cn("font-semibold tracking-tight", compact ? "text-base" : "text-xl")}>Modern Glass Villa</h3>
                <p className="text-sm text-muted-foreground/80">Beverly Hills, CA</p>
              </div>

              <div className={cn("font-bold font-mono", compact ? "text-xl" : "text-2xl")}>$2,500,000</div>

              <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/20">
                <Briefcase className="h-4 w-4" />
                <span>2 Offers Received</span>
              </div>

              <Button className={cn("bg-white/10 hover:bg-white/20 border border-white/10", centered ? "w-auto px-6 mx-auto" : "w-full")} variant="outline">
                View Offers
              </Button>
            </div>
          </div>
        </div>

        <div className={cn("group relative overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-background via-violet-500/10 to-background/90 backdrop-blur-xl shadow-[0_10px_28px_rgba(124,58,237,0.14)] transition-all hover:border-violet-300/45 hover:shadow-[0_14px_34px_rgba(124,58,237,0.2)] flex flex-col", compact ? "min-w-[260px] p-4" : "p-6")}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />

          <div className={cn("relative z-10 flex flex-col h-full gap-4", centered && "items-center text-center")}>
            <div className={cn("flex items-center", centered ? "justify-center gap-2" : "justify-between")}>
              <div className={cn("bg-purple-500/10 w-fit rounded-xl text-purple-400", compact ? "p-2" : "p-3", centered && "mx-auto")}>
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">
                Market Intelligence
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className={cn("font-semibold tracking-tight", compact ? "text-base" : "text-xl")}>Market Intelligence</h3>
                <p className="text-sm text-muted-foreground/80">Market indicators and activity trends for your area</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-muted-foreground mb-1">Market Trend</div>
                  <div className="text-lg font-bold text-green-400 flex items-center gap-1">▲ 4.2%</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-muted-foreground mb-1">Avg. Days</div>
                  <div className="text-lg font-bold">14 Days</div>
                </div>
              </div>

              <Button className={cn("bg-white/10 hover:bg-white/20 border border-white/10", centered ? "w-auto px-6 mx-auto" : "w-full")} variant="outline">
                Full Report
              </Button>
            </div>
          </div>
        </div>

        {showAgentCard && (
        <div className={cn("group relative overflow-hidden rounded-3xl border border-orange-400/25 bg-gradient-to-br from-background via-orange-500/10 to-background/90 backdrop-blur-xl shadow-[0_10px_28px_rgba(249,115,22,0.14)] transition-all hover:border-orange-300/45 hover:shadow-[0_14px_34px_rgba(249,115,22,0.2)] flex flex-col", compact ? "min-w-[260px] p-4" : "p-6")}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />

          <div className={cn("relative z-10 flex flex-col h-full gap-4", centered && "items-center text-center")}>
            <div className={cn("bg-orange-500/10 w-fit rounded-xl text-orange-400", compact ? "p-2" : "p-3", centered && "mx-auto")}>
              <LayoutDashboard className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className={cn("font-semibold tracking-tight", compact ? "text-base" : "text-xl")}>Agent Dashboard</h3>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                Manage listings, view analytics, and showcase your portfolio.
              </p>
            </div>

            <div className={cn("relative z-10 mt-auto pt-4 border-t border-white/5 flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors", centered && "justify-center w-full")}>
              <span>Explore</span>
              <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
