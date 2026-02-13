"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Building2, Globe2, PlayCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function FeaturesSectionWithBentoGrid() {
  const features = [
    {
      title: "Broker Visibility",
      description: "See team capacity, listing health, and market movement at a glance.",
      skeleton: <SkeletonOne />,
      className: "col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r border-primary/20",
    },
    {
      title: "Market Capture",
      description: "Use AI-assisted workflows to monitor opportunities in target neighborhoods.",
      skeleton: <SkeletonTwo />,
      className: "col-span-1 md:col-span-2 lg:col-span-2 border-b border-primary/20",
    },
    {
      title: "Training & Playbooks",
      description: "Centralized operating playbooks and brokerage onboarding channels.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r border-primary/20",
    },
    {
      title: "Territory Coverage",
      description: "Track service area saturation, expansion opportunities, and network impact.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none border-primary/20",
    },
  ];

  return (
    <section className="relative z-20 py-12 lg:py-24 max-w-7xl mx-auto">
      <div className="px-4 md:px-8">
        <h4 className="text-3xl lg:text-5xl max-w-4xl mx-auto text-center tracking-tight font-semibold">
          Brokerage Infrastructure That Scales
        </h4>
        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-muted-foreground text-center">
          Built for multi-agent teams, complex deal pipelines, and high-performance market execution.
        </p>
      </div>

      <div className="relative mt-10">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 xl:border rounded-xl border-primary/20 bg-background/70 overflow-hidden">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({ children, className }: { children?: ReactNode; className?: string }) => {
  return <div className={cn("p-4 sm:p-8 relative overflow-hidden", className)}>{children}</div>;
};

const FeatureTitle = ({ children }: { children?: ReactNode }) => {
  return <p className="text-left text-xl md:text-2xl font-semibold">{children}</p>;
};

const FeatureDescription = ({ children }: { children?: ReactNode }) => {
  return <p className="text-sm md:text-base text-muted-foreground text-left max-w-sm my-2">{children}</p>;
};

const SkeletonOne = () => (
  <div className="relative flex py-6 px-2 h-full">
    <div className="w-full p-5 bg-gradient-to-br from-primary/10 to-background border rounded-xl h-full">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-xs text-muted-foreground">Compliance Health</span>
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full w-[84%] bg-primary/80" /></div>
          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full w-[68%] bg-primary/60" /></div>
          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full w-[92%] bg-primary" /></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonTwo = () => {
  const images = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&fit=crop",
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&fit=crop",
  ];

  return (
    <div className="relative flex flex-col items-start p-4 gap-4 h-full overflow-hidden">
      <div className="flex gap-3">
        {images.map((image, idx) => (
          <motion.img
            key={idx}
            initial={{ rotate: idx % 2 === 0 ? -6 : 6 }}
            whileHover={{ scale: 1.06, rotate: 0 }}
            src={image}
            alt="market"
            className="h-24 w-24 md:h-28 md:w-28 rounded-lg object-cover border"
          />
        ))}
      </div>
    </div>
  );
};

const SkeletonThree = () => (
  <Link href="/explore" className="relative flex gap-10 h-full group/image">
    <div className="w-full group h-full relative">
      <PlayCircle className="h-14 w-14 absolute z-10 inset-0 m-auto text-primary" />
      <img
        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&fit=crop"
        alt="training"
        className="h-full w-full object-cover rounded-lg blur-none group-hover/image:blur-[2px] transition-all duration-200"
      />
      <div className="absolute inset-0 bg-black/20 rounded-lg" />
    </div>
  </Link>
);

const SkeletonFour = () => (
  <div className="h-56 flex items-center justify-center relative mt-4">
    <div className="absolute inset-0 m-auto h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
    <div className="relative rounded-full border border-primary/30 p-8 bg-background/80">
      <Globe2 className="h-10 w-10 text-primary" />
    </div>
    <div className="absolute bottom-4 left-4 rounded-lg border px-3 py-1 text-xs bg-background/80 flex items-center gap-1">
      <Building2 className="h-3.5 w-3.5" /> 42 markets
    </div>
  </div>
);
