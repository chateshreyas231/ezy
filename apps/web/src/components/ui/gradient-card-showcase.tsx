import React from "react";

type GradientSkewCardProps = {
  title: string;
  description?: string;
  gradientFrom: string;
  gradientTo: string;
  showGradient?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const cards = [
  {
    title: "Card one",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    gradientFrom: "#ffbc00",
    gradientTo: "#ff0058",
  },
  {
    title: "Card two",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    gradientFrom: "#03a9f4",
    gradientTo: "#ff0058",
  },
  {
    title: "Card three",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    gradientFrom: "#4dff03",
    gradientTo: "#00d0ff",
  },
];

export function GradientSkewCard({
  title,
  description,
  gradientFrom,
  gradientTo,
  showGradient = true,
  className = "",
  children,
}: GradientSkewCardProps) {
  const plainMode = !showGradient;

  return (
    <div className={`group relative transition-all duration-500 ${className}`}>
      {showGradient ? (
        <>
          <span
            className="absolute inset-y-0 left-[40px] w-1/2 rounded-lg skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[16px] group-hover:w-[calc(100%-72px)]"
            style={{
              background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
            }}
          />
          <span
            className="absolute inset-y-0 left-[40px] w-1/2 rounded-lg skew-x-[15deg] blur-[28px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[16px] group-hover:w-[calc(100%-72px)]"
            style={{
              background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
            }}
          />

          <span className="pointer-events-none absolute inset-0 z-10">
            <span className="gradient-blob absolute top-0 left-0 h-0 w-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.12)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-150 group-hover:top-[-32px] group-hover:left-[36px] group-hover:h-[72px] group-hover:w-[72px] group-hover:opacity-100" />
            <span className="gradient-blob gradient-blob-delay absolute bottom-0 right-0 h-0 w-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.12)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:bottom-[-32px] group-hover:right-[36px] group-hover:h-[72px] group-hover:w-[72px] group-hover:opacity-100" />
          </span>
        </>
      ) : null}

      <div
        className={`relative z-20 left-0 rounded-lg p-5 shadow-lg backdrop-blur-[10px] transition-all duration-500 group-hover:left-[-14px] group-hover:p-6 ${
          plainMode
            ? "border border-border/70 bg-card/95 text-foreground"
            : "bg-[rgba(18,18,18,0.6)] text-white"
        }`}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className={`mt-2 text-sm leading-relaxed ${plainMode ? "text-muted-foreground" : "text-white/80"}`}>
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export default function SkewCards() {
  return (
    <div className="flex min-h-screen flex-wrap items-center justify-center bg-zinc-950 py-10">
      {cards.map(({ title, desc, gradientFrom, gradientTo }, idx) => (
        <GradientSkewCard
          key={idx}
          className="m-[40px_30px] h-[400px] w-[320px]"
          title={title}
          description={desc}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
        >
          <a
            href="#"
            className="mt-4 inline-block rounded bg-white px-3 py-2 text-sm font-bold text-black hover:border hover:border-[rgba(255,0,88,0.4)] hover:bg-[#ffcf4d] hover:shadow-md"
          >
            Read More
          </a>
        </GradientSkewCard>
      ))}
    </div>
  );
}
