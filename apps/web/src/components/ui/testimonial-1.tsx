"use client";

import { type ComponentType, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CreditCard,
  Landmark,
  TrendingUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StatItem = {
  value: string;
  label: string;
  isIncrease: boolean;
  Icon: ComponentType<{ className?: string }>;
};

const stats: StatItem[] = [
  {
    value: "80%",
    label: "fewer manual follow-ups",
    isIncrease: false,
    Icon: Building2,
  },
  {
    value: "30%",
    label: "lower coordination overhead",
    isIncrease: false,
    Icon: CreditCard,
  },
  {
    value: "25%",
    label: "faster deal reconciliation",
    isIncrease: false,
    Icon: Landmark,
  },
  {
    value: "$100K",
    label: "saved yearly for active teams",
    isIncrease: true,
    Icon: TrendingUp,
  },
];

const testimonials = [
  {
    name: "Ava Thompson",
    role: "Buyer Agent, Los Angeles",
    quote:
      "Ezriya keeps my clients, listings, and deal tasks in one workflow. I spend more time closing and less time chasing updates.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Noah Rivera",
    role: "Listing Agent, Austin",
    quote:
      "Our handoffs are finally clear. Everyone sees the same next step, and transactions move faster with fewer surprises.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
];

export default function Testimonial1() {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  return (
    <section className="w-full py-20 px-4 md:px-8 lg:px-16 bg-muted/30 border-y border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs uppercase tracking-wider font-medium">
            Why Ezriya
          </div>
        </div>

        <div className="text-center max-w-screen-xl mx-auto relative text-foreground">
          <h2 className="text-xl md:text-2xl lg:text-4xl font-semibold leading-tight">
            We make it easy for
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-block mx-2 align-middle relative"
                    onMouseEnter={() => setHoveredImage(testimonials[0].name)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <div className="relative overflow-hidden sm:w-16 w-12 h-12 origin-center transition-all duration-300 md:hover:w-28 rounded-full border-2 border-background">
                      <img
                        src={testimonials[0].image}
                        alt={testimonials[0].name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-background text-foreground p-4 rounded-lg shadow-lg">
                  <p className="mb-2 text-sm">&ldquo;{testimonials[0].quote}&rdquo;</p>
                  <p className="font-medium text-sm">{testimonials[0].name}</p>
                  <p className="text-xs text-muted-foreground">{testimonials[0].role}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            agents and brokers
          </h2>

          <h2 className="text-xl md:text-2xl lg:text-4xl font-semibold leading-tight mt-2">
            and their
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-block mx-2 align-middle"
                    onMouseEnter={() => setHoveredImage(testimonials[1].name)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <div className="relative overflow-hidden sm:w-16 w-14 h-14 origin-center transition-all duration-300 lg:hover:w-28 md:hover:w-24 rounded-full border-2 border-background">
                      <img
                        src={testimonials[1].image}
                        alt={testimonials[1].name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-background text-foreground p-4 rounded-lg shadow-lg">
                  <p className="mb-2 text-sm">&ldquo;{testimonials[1].quote}&rdquo;</p>
                  <p className="font-medium text-sm">{testimonials[1].name}</p>
                  <p className="text-xs text-muted-foreground">{testimonials[1].role}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            clients to collaborate,
          </h2>

          <h2 className="text-xl md:text-2xl lg:text-4xl font-semibold text-foreground leading-tight mt-2">
            manage listings, and close with confidence
          </h2>

          {hoveredImage && (
            <p className="mt-4 text-xs text-muted-foreground">Trusted by teams like {hoveredImage}</p>
          )}
        </div>

        <div className="sm:flex grid grid-cols-2 gap-8 bg-background mt-8 w-full mx-auto px-8 py-6 border rounded-md border-border">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex-1 flex gap-4 pl-10 relative">
              {index !== 0 && (
                <div className="hidden sm:block w-px h-9 border border-dashed border-border absolute left-0" />
              )}

              <div className="w-full h-full group relative">
                <div className="w-full h-10 flex items-center justify-center translate-y-0 group-hover:-translate-y-12 opacity-100 group-hover:opacity-0 transition-all duration-300 ease-out">
                  <stat.Icon className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="absolute left-0 top-8 opacity-0 flex flex-col items-center justify-center w-full group-hover:-top-3.5 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <div className="flex items-center justify-center gap-2 relative">
                    {stat.isIncrease ? (
                      <ArrowUp className="md:w-6 md:h-6 w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="md:w-6 md:h-6 w-4 h-4 text-foreground" />
                    )}
                    <span className="md:text-4xl text-2xl font-semibold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-foreground md:text-sm text-xs text-center capitalize">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
