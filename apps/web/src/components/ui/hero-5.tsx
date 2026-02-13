import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FADE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.8 } },
};

const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface Feature {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
}

interface EthicalHeroProps {
  title: React.ReactNode;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  features: Feature[];
  topContent?: React.ReactNode;
}

export function EthicalHero({ title, subtitle, ctaLabel, ctaHref, features, topContent }: EthicalHeroProps) {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={STAGGER_CONTAINER_VARIANTS}
      className="container mx-auto max-w-6xl px-4 py-10 sm:py-14"
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1 variants={FADE_UP_VARIANTS} className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          {title}
        </motion.h1>

        <motion.p variants={FADE_UP_VARIANTS} className="mt-6 text-lg leading-8 text-muted-foreground">
          {subtitle}
        </motion.p>

        <motion.div variants={FADE_UP_VARIANTS} className="mt-10">
          <Button size="lg" asChild>
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        </motion.div>
      </div>

      {topContent ? <motion.div variants={FADE_UP_VARIANTS} className="mt-10">{topContent}</motion.div> : null}

      <motion.div variants={STAGGER_CONTAINER_VARIANTS} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <motion.a
            key={feature.id}
            href={feature.href}
            aria-label={feature.title}
            variants={FADE_UP_VARIANTS}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="block"
          >
            <Card className="group h-full overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-md">
              <div className="overflow-hidden">
                <img
                  src={feature.imageUrl}
                  alt={feature.title}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 transition-colors duration-300 group-hover:bg-muted">
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.a>
        ))}
      </motion.div>
    </motion.section>
  );
}
