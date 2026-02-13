"use client";

import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

type AboutSectionProps = {
  sectionLabel?: string;
  brandName: string;
  roleLabel: string;
  heroImage: string;
  yearsExperience: string;
  metricOneLabel: string;
  metricTwoValue: string;
  metricTwoLabel: string;
  heading: string;
  paragraphOne: string;
  paragraphTwo: string;
};

export default function AboutSection3({
  sectionLabel = "WHO WE ARE",
  brandName,
  roleLabel,
  heroImage,
  yearsExperience,
  metricOneLabel,
  metricTwoValue,
  metricTwoLabel,
  heading,
  paragraphOne,
  paragraphTwo,
}: AboutSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.12, duration: 0.35 },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <section className="py-8 px-4 bg-[#f9f9f9] border border-neutral-200 rounded-2xl" ref={heroRef}>
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          <div className="flex justify-between items-center mb-6 w-[92%] absolute top-1 z-10">
            <div className="flex items-center gap-2 text-xl">
              <span className="text-red-500">✱</span>
              <TimelineContent
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-sm font-medium text-gray-600"
              >
                {sectionLabel}
              </TimelineContent>
            </div>
            <div className="flex gap-2">
              {["facebook", "instagram", "linkedin", "youtube"].map((icon, idx) => (
                <TimelineContent
                  key={icon}
                  animationNum={idx + 1}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  className="w-7 h-7 border border-gray-200 bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  <img src={`https://pro-section.ui-layouts.com/${icon}.svg`} alt={icon} width={16} height={16} />
                </TimelineContent>
              ))}
            </div>
          </div>

          <TimelineContent
            animationNum={5}
            timelineRef={heroRef}
            customVariants={revealVariants}
            className="relative group"
          >
            <div className="h-56 md:h-72 rounded-2xl overflow-hidden border border-neutral-200">
              <img src={heroImage} alt={brandName} className="w-full h-full object-cover" />
            </div>
          </TimelineContent>

          <div className="flex flex-wrap justify-between items-center py-3 text-sm">
            <TimelineContent
              animationNum={6}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm">
                <span className="text-red-500 font-bold">{yearsExperience}</span>
                <span className="text-gray-600">{metricOneLabel}</span>
                <span className="text-gray-300">|</span>
              </div>
              <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm">
                <span className="text-red-500 font-bold">{metricTwoValue}</span>
                <span className="text-gray-600">{metricTwoLabel}</span>
              </div>
            </TimelineContent>

            <TimelineContent
              animationNum={7}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-red-500 font-semibold uppercase">{brandName}</span>
              <span className="text-gray-500">{roleLabel}</span>
            </TimelineContent>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-2">
          <div className="md:col-span-2">
            <h1 className="sm:text-4xl md:text-5xl text-2xl !leading-[110%] font-semibold text-gray-900 mb-8">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.06}
                staggerFrom="first"
                reverse
                transition={{ type: "spring", stiffness: 250, damping: 30, delay: 0.15 }}
              >
                {heading}
              </VerticalCutReveal>
            </h1>

            <TimelineContent
              animationNum={8}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid md:grid-cols-2 gap-8 text-gray-600"
            >
              <p className="leading-relaxed text-justify text-sm">{paragraphOne}</p>
              <p className="leading-relaxed text-justify text-sm">{paragraphTwo}</p>
            </TimelineContent>
          </div>

          <div className="md:col-span-1">
            <div className="text-right">
              <TimelineContent
                animationNum={9}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-red-500 text-2xl font-bold mb-2"
              >
                {brandName.split(" ")[0].toUpperCase()}
              </TimelineContent>
              <TimelineContent
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-gray-600 text-sm mb-8"
              >
                {roleLabel}
              </TimelineContent>

              <TimelineContent
                animationNum={11}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="bg-neutral-900 hover:bg-neutral-950 border border-neutral-700 flex w-fit ml-auto gap-2 hover:gap-4 transition-all duration-300 text-white px-5 py-3 rounded-lg cursor-pointer font-semibold"
              >
                VIEW BROKER DECK <ArrowRight />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
