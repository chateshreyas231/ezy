"use client";

import React, { memo, useEffect, useState } from "react";
import {
  Building2,
  ClipboardList,
  Handshake,
  Home,
  Store,
  UserRound,
  Users,
} from "lucide-react";

type IconType = "agents" | "brokers" | "listings" | "buyers" | "sellers" | "vendors";
type GlowColor = "cyan" | "purple";

interface SkillIconProps {
  type: IconType;
}

interface SkillConfig {
  id: string;
  orbitRadius: number;
  size: number;
  speed: number;
  iconType: IconType;
  phaseShift: number;
  glowColor: GlowColor;
  label: string;
}

interface OrbitingSkillProps {
  config: SkillConfig;
  angle: number;
}

interface GlowingOrbitPathProps {
  radius: number;
  glowColor?: GlowColor;
  animationDelay?: number;
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

const skillsConfig: SkillConfig[] = [
  { id: "agents", orbitRadius: 105, size: 42, speed: 1, iconType: "agents", phaseShift: 0, glowColor: "cyan", label: "Agents" },
  { id: "brokers", orbitRadius: 105, size: 45, speed: 1, iconType: "brokers", phaseShift: (2 * Math.PI) / 3, glowColor: "cyan", label: "Brokers" },
  { id: "listings", orbitRadius: 105, size: 42, speed: 1, iconType: "listings", phaseShift: (4 * Math.PI) / 3, glowColor: "cyan", label: "Listings" },
  { id: "buyers", orbitRadius: 185, size: 48, speed: -0.6, iconType: "buyers", phaseShift: 0, glowColor: "purple", label: "Buyers" },
  { id: "sellers", orbitRadius: 185, size: 45, speed: -0.6, iconType: "sellers", phaseShift: (2 * Math.PI) / 3, glowColor: "purple", label: "Sellers" },
  { id: "vendors", orbitRadius: 185, size: 42, speed: -0.6, iconType: "vendors", phaseShift: (4 * Math.PI) / 3, glowColor: "purple", label: "Vendors" },
];

const OrbitingSkill = memo(({ config, angle }: OrbitingSkillProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { orbitRadius, size, iconType, label } = config;

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  return (
    <div
      className="absolute left-1/2 top-1/2 transition-all duration-300 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isHovered ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900/90 p-2 backdrop-blur-sm transition-all duration-300 ${
          isHovered ? "scale-125 shadow-2xl" : "shadow-lg hover:shadow-xl"
        }`}
        style={{
          boxShadow: isHovered
            ? `0 0 30px ${iconComponents[iconType]?.color}40, 0 0 60px ${iconComponents[iconType]?.color}20`
            : undefined,
        }}
      >
        <SkillIcon type={iconType} />
        {isHovered && (
          <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-950/95 px-2 py-1 text-xs text-white">
            {label}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingSkill.displayName = "OrbitingSkill";

const GlowingOrbitPath = memo(({ radius, glowColor = "cyan", animationDelay = 0 }: GlowingOrbitPathProps) => {
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
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ width: `${radius * 2}px`, height: `${radius * 2}px`, animationDelay: `${animationDelay}s` }}
    >
      <div
        className="absolute inset-0 animate-pulse rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 60px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
          animation: "pulse 4s ease-in-out infinite",
          animationDelay: `${animationDelay}s`,
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
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime((prevTime) => prevTime + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const orbitConfigs: Array<{ radius: number; glowColor: GlowColor; delay: number }> = [
    { radius: 105, glowColor: "cyan", delay: 0 },
    { radius: 185, glowColor: "purple", delay: 1.5 },
  ];

  return (
    <main className="relative w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, #374151 0%, transparent 50%), radial-gradient(circle at 75% 75%, #4B5563 0%, transparent 50%)",
          }}
        />
      </div>

      <div
        className="relative flex h-[calc(100vw-40px)] w-[calc(100vw-40px)] items-center justify-center md:h-[460px] md:w-[460px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="relative z-10 flex flex-col items-center text-white">
            <Handshake className="h-7 w-7 mb-1" />
            <span className="text-[10px] font-semibold tracking-[0.16em]">EZRIYA</span>
          </div>
        </div>

        {orbitConfigs.map((config) => (
          <GlowingOrbitPath
            key={`path-${config.radius}`}
            radius={config.radius}
            glowColor={config.glowColor}
            animationDelay={config.delay}
          />
        ))}

        {skillsConfig.map((config) => {
          const angle = time * config.speed + (config.phaseShift || 0);
          return <OrbitingSkill key={config.id} config={config} angle={angle} />;
        })}
      </div>
    </main>
  );
}
