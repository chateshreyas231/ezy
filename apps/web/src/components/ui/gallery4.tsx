"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

export interface Gallery4Item {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface Gallery4Props {
  title?: string;
  description?: string;
  items: Gallery4Item[];
}

const defaultData: Gallery4Item[] = [
  {
    id: "market-1",
    title: "Luxury Segment Expansion",
    description: "How broker teams scaled premium inventory through referral and builder channels.",
    href: "#",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1080&fit=crop",
  },
  {
    id: "market-2",
    title: "Commercial Pipeline Strategy",
    description: "A blueprint for improving close rates in office and mixed-use negotiations.",
    href: "#",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1080&fit=crop",
  },
  {
    id: "market-3",
    title: "Agent Coaching Framework",
    description: "Leadership cadence that increased team productivity and conversion consistency.",
    href: "#",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1080&fit=crop",
  },
];

const Gallery4 = ({
  title = "Broker Case Studies",
  description = "A quick look at strategies, playbooks, and execution patterns driving top brokerage performance.",
  items = defaultData,
}: Gallery4Props) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const maxIndex = Math.max(items.length - 1, 0);

  const canScrollPrev = currentSlide > 0;
  const canScrollNext = currentSlide < maxIndex;

  const visibleItems = useMemo(() => {
    const slice = items.slice(currentSlide, currentSlide + 3);
    if (slice.length < 3) return items.slice(Math.max(0, items.length - 3), items.length);
    return slice;
  }, [items, currentSlide]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
            <p className="max-w-2xl text-muted-foreground">{description}</p>
          </div>
          <div className="hidden gap-2 md:flex">
            <Button size="icon" variant="ghost" disabled={!canScrollPrev} onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}>
              <ArrowLeft className="size-5" />
            </Button>
            <Button size="icon" variant="ghost" disabled={!canScrollNext} onClick={() => setCurrentSlide((s) => Math.min(maxIndex, s + 1))}>
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {visibleItems.map((item) => (
            <a key={item.id} href={item.href} className="group rounded-xl border border-primary/20 overflow-hidden bg-background/80">
              <div className="relative h-56">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-lg font-semibold leading-tight">{item.title}</p>
                  <p className="mt-1 text-xs text-white/85">{item.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${currentSlide === index ? "bg-primary" : "bg-primary/20"}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { Gallery4 };
