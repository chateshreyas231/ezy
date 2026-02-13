"use client";

import Link from "next/link";
import { DottedSurface } from "@/components/ui/dotted-surface";

type Section = {
  title: string;
  body: string[];
};

export function InfoPageLayout({
  eyebrow,
  title,
  subtitle,
  sections,
  updatedAt,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: Section[];
  updatedAt: string;
}) {
  return (
    <DottedSurface className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">{title}</h1>
          <p className="text-base md:text-lg text-muted-foreground">{subtitle}</p>
          <p className="text-xs text-muted-foreground/80">Last updated: {updatedAt}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background/80 backdrop-blur p-5 md:p-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="space-y-2">
                {section.body.map((paragraph, idx) => (
                  <p key={`${section.title}-${idx}`} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-4">
          <span>Questions?</span>
          <a href="mailto:hello@ezriya.com" className="text-foreground hover:underline">
            hello@ezriya.com
          </a>
          <Link href="/" className="text-foreground hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </DottedSurface>
  );
}
