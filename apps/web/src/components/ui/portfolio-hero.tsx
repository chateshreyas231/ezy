"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

type PortfolioHeroProps = {
  firstName: string;
  lastName: string;
  imageUrl: string;
  tagline: string;
  scrollTargetId?: string;
};

type BlurTextProps = {
  text: string;
  delay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  className?: string;
  style?: CSSProperties;
};

function BlurText({
  text,
  delay = 50,
  animateBy = "words",
  direction = "top",
  className = "",
  style,
}: BlurTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 },
    );

    const node = ref.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  const segments = useMemo(
    () => (animateBy === "words" ? text.split(" ") : text.split("")),
    [text, animateBy],
  );

  return (
    <p ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {segments.map((segment, i) => (
        <span
          key={`${segment}-${i}`}
          style={{
            display: "inline-block",
            filter: inView ? "blur(0px)" : "blur(10px)",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : `translateY(${direction === "top" ? "-20px" : "20px"})`,
            transition: `all 0.5s ease-out ${i * delay}ms`,
          }}
        >
          {segment}
          {animateBy === "words" && i < segments.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}

export default function PortfolioHero({
  firstName,
  lastName,
  imageUrl,
  tagline,
  scrollTargetId = "agent-details",
}: PortfolioHeroProps) {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const menuItems = [
    { label: "HOME", href: "#top", highlight: true },
    { label: "ABOUT", href: "#agent-overview" },
    { label: "LISTINGS", href: "#agent-listings" },
    { label: "NETWORK", href: "#agent-network" },
    { label: "REVIEWS", href: "#agent-reviews" },
    { label: "CONTACT", href: "#agent-contact" },
  ];

  const textColor = isDark ? "hsl(0 0% 100%)" : "hsl(0 0% 10%)";
  const surfaceColor = isDark ? "hsl(0 0% 0%)" : "hsl(0 0% 98%)";

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: surfaceColor, color: textColor }}>
      <header className="sticky top-0 left-0 right-0 z-30 px-6 py-6">
        <nav className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              className="p-2 transition-colors duration-300 z-50 text-neutral-500 hover:text-black dark:hover:text-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-8 h-8" strokeWidth={2} /> : <Menu className="w-8 h-8" strokeWidth={2} />}
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute top-full left-0 w-[220px] border-none shadow-2xl mt-2 ml-4 p-4 rounded-lg z-[100]"
                style={{ backgroundColor: surfaceColor }}
              >
                {menuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block text-lg font-bold tracking-tight py-1.5 px-2 transition-colors"
                    style={{ color: item.highlight ? "#C3E41D" : textColor }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="text-4xl" style={{ color: textColor, fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive" }}>
            A
          </div>

          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            className="relative w-16 h-8 rounded-full hover:opacity-80 transition-opacity"
            style={{ backgroundColor: isDark ? "hsl(0 0% 15%)" : "hsl(0 0% 90%)" }}
            aria-label="Toggle hero theme"
          >
            <div
              className="absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300"
              style={{
                backgroundColor: isDark ? "hsl(0 0% 100%)" : "hsl(0 0% 10%)",
                transform: isDark ? "translateX(2rem)" : "translateX(0)",
              }}
            />
          </button>
        </nav>
      </header>

      <main className="relative min-h-[calc(100vh-88px)] flex flex-col">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
          <div className="relative text-center">
            <BlurText
              text={firstName.toUpperCase()}
              delay={100}
              animateBy="letters"
              direction="top"
              className="font-bold text-[92px] sm:text-[130px] md:text-[170px] lg:text-[200px] leading-[0.75] tracking-tighter uppercase justify-center whitespace-nowrap"
              style={{ color: "#C3E41D", fontFamily: "'Fira Code', monospace" }}
            />
            <BlurText
              text={lastName.toUpperCase()}
              delay={100}
              animateBy="letters"
              direction="top"
              className="font-bold text-[92px] sm:text-[130px] md:text-[170px] lg:text-[200px] leading-[0.75] tracking-tighter uppercase justify-center whitespace-nowrap"
              style={{ color: "#C3E41D", fontFamily: "'Fira Code', monospace" }}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-[72px] h-[118px] sm:w-[92px] sm:h-[154px] md:w-[112px] md:h-[188px] lg:w-[132px] lg:h-[222px] rounded-full overflow-hidden shadow-2xl">
                <img src={imageUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 w-full px-6">
          <div className="flex justify-center">
            <BlurText
              text={tagline}
              delay={150}
              animateBy="words"
              direction="top"
              className="text-[15px] sm:text-[18px] md:text-[20px] lg:text-[22px] text-center text-neutral-500"
              style={{ fontFamily: "'Antic', sans-serif" }}
            />
          </div>
        </div>

        <button
          type="button"
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 transition-colors duration-300 text-neutral-500 hover:text-white"
          aria-label="Scroll down"
          onClick={() => {
            const target = document.getElementById(scrollTargetId);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </main>
    </div>
  );
}
