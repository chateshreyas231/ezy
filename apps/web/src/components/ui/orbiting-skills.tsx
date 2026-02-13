"use client";

import React, { memo, useState } from "react";
import {
  Building2,
  ClipboardList,
  Handshake,
  Home,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = "agents" | "brokers" | "listings" | "buyers" | "sellers" | "vendors";
type GlowColor = "cyan" | "purple";

interface SkillIconProps {
  type: IconType;
}

interface SkillConfig {
  id: string;
  iconType: IconType;
  label: string;
  angle: number; // Initial angle in degrees
}

interface OrbitGroupConfig {
  radius: number;
  duration: number; // Seconds for full rotation
  direction: "clockwise" | "counter-clockwise";
  glowColor: GlowColor;
  skills: SkillConfig[];
}

const iconComponents: Record<IconType, { component: () => React.JSX.Element; color: string }> = {
  agents: {
    component: () => <UserRound className="h-full w-full text-cyan-300" />,
    color: "#67E8F9",
  },
  brokers: {
    component: () => <Building2 className="h-full w-full text-violet-300" />,
    color: "#C4B5FD",
  },
  listings: {
    component: () => <ClipboardList className="h-full w-full text-blue-300" />,
    color: "#93C5FD",
  },
  buyers: {
    component: () => <Users className="h-full w-full text-emerald-300" />,
    color: "#6EE7B7",
  },
  sellers: {
    component: () => <Home className="h-full w-full text-orange-300" />,
    color: "#FDBA74",
  },
  vendors: {
    component: () => <Store className="h-full w-full text-pink-300" />,
    color: "#F9A8D4",
  },
};

const SkillIcon = memo(({ type }: SkillIconProps) => {
  const IconComponent = iconComponents[type]?.component;
  return IconComponent ? <IconComponent /> : null;
});
SkillIcon.displayName = "SkillIcon";

// Configuration for the two orbits
const orbitGroups: OrbitGroupConfig[] = [
  {
    radius: 105,
    duration: 20,
    direction: "clockwise",
    glowColor: "cyan",
    skills: [
      { id: "agents", iconType: "agents", label: "Agents", angle: 0 },
      { id: "brokers", iconType: "brokers", label: "Brokers", angle: 120 },
      { id: "listings", iconType: "listings", label: "Listings", angle: 240 },
    ],
  },
  {
    radius: 185,
    duration: 35, // Slower outer orbit
    direction: "counter-clockwise",
    glowColor: "purple",
    skills: [
      { id: "buyers", iconType: "buyers", label: "Buyers", angle: 0 },
      { id: "sellers", iconType: "sellers", label: "Sellers", angle: 120 },
      { id: "vendors", iconType: "vendors", label: "Vendors", angle: 240 },
    ],
  },
];

const OrbitingItem = memo(({ skill, radius, duration, direction, reverse }: {
  skill: SkillConfig;
  radius: number;
  duration: number;
  direction: "normal" | "reverse";
  reverse?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { iconType, label, angle } = skill;

  // Calculate position on the circle
  // We use a fixed position here because the parent container rotates
  // But wait, if we put them in a rotating container, they are fixed relative to container.
  // The container rotates. The items need to counter-rotate to stay upright.

  // Actually, standard CSS orbit pattern:
  // Container: relative, animate-spin.
  // Item: absolute, transform: rotate(angle) translate(radius) rotate(-angle). (Static placement on ring)
  // If Container rotates, the whole ring spins.
  // To keep Item upright: Item needs a counter-rotation animation matching the container's speed.

  return (
    <div
      className="absolute top-1/2 left-1/2 -ml-[22px] -mt-[22px]"
      style={{
        transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
      }}
    >
      <div
        className="w-[44px] h-[44px]"
        style={{
          animation: `spin-${direction === "normal" ? "reverse" : "normal"} ${duration}s linear infinite`,
        }}
      >
        <div
          className={cn(
            "relative flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900/90 p-2 backdrop-blur-sm transition-all duration-300",
            isHovered ? "scale-125 shadow-2xl" : "shadow-lg hover:shadow-xl"
          )}
          style={{
            boxShadow: isHovered
              ? `0 0 30px ${iconComponents[iconType]?.color}40, 0 0 60px ${iconComponents[iconType]?.color}20`
              : undefined,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <SkillIcon type={iconType} />
          {isHovered && (
            <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-950/95 px-2 py-1 text-xs text-white z-50">
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
OrbitingItem.displayName = "OrbitingItem";

const OrbitRing = memo(({ config }: { config: OrbitGroupConfig }) => {
  const { radius, duration, direction, skills, glowColor } = config;
  const isClockwise = direction === "clockwise";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* The rotating ring container */}
      <div
        className="absolute flex items-center justify-center pointer-events-auto"
        style={{
          width: radius * 2,
          height: radius * 2,
          animation: `spin-${isClockwise ? "normal" : "reverse"} ${duration}s linear infinite`,
        }}
      >
        {skills.map((skill) => (
          <OrbitingItem
            key={skill.id}
            skill={skill}
            radius={radius}
            duration={duration}
            direction={isClockwise ? "normal" : "reverse"}
          />
        ))}
      </div>

      {/* Static Glow Path */}
      <GlowingOrbitPath radius={radius} glowColor={glowColor} />
    </div>
  );
});
OrbitRing.displayName = "OrbitRing";

interface GlowingOrbitPathProps {
  radius: number;
  glowColor?: GlowColor;
}

const GlowingOrbitPath = memo(({ radius, glowColor = "cyan" }: GlowingOrbitPathProps) => {
  const glowColors = {
    cyan: {
      primary: "rgba(6, 182, 212, 0.4)",
      secondary: "rgba(6, 182, 212, 0.2)",
      border: "rgba(6, 182, 212, 0.3)",
    },
    purple: {
      primary: "rgba(147, 51, 234, 0.4)",
      secondary: "rgba(147, 51, 234, 0.2)",
      border: "rgba(147, 51, 234, 0.3)",
    },
  };
  const colors = glowColors[glowColor] || glowColors.cyan;

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
    >
      <div
        className="absolute inset-0 animate-pulse rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 60px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${colors.border}`, boxShadow: `inset 0 0 20px ${colors.secondary}` }}
      />
    </div>
  );
});
GlowingOrbitPath.displayName = "GlowingOrbitPath";

export default function OrbitingSkills() {
  return (
    <main className="relative w-full overflow-hidden flex items-center justify-center">
      {/* Define Keyframes for Spin if not in global CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
            @keyframes spin-normal {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes spin-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
            }
        `}} />
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, #374151 0%, transparent 50%), radial-gradient(circle at 75% 75%, #4B5563 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative flex h-[calc(100vw-40px)] w-[calc(100vw-40px)] items-center justify-center md:h-[460px] md:w-[460px]">
        {/* Center Logo */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="relative z-10 flex flex-col items-center text-white">
            <Handshake className="h-7 w-7 mb-1" />
            <span className="text-[10px] font-semibold tracking-[0.16em]">EZRIYA</span>
          </div>
        </div>

        {/* Orbit Rings */}
        {orbitGroups.map((group) => (
          <OrbitRing key={group.radius} config={group} />
        ))}
      </div>
    </main>
  );
}
