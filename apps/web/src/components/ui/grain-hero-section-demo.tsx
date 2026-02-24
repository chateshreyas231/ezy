"use client";

import GrainHeroSection from '@/components/ui/grain-gradient-hero-section';

export default function GrainHeroSectionDemo() {
    return (
        <GrainHeroSection
            title="Design Beyond Limits"
            subtitle="Create stunning, high-performance backgrounds effortlessly with Paper Shaders. Experience the power of grain gradients in modern web design."
            ctaLabel="Get Started"
            onCtaClick={() => console.log('CTA clicked')}
        />
    );
}
