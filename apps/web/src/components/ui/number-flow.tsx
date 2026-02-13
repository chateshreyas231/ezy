"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Value = number;

type NumberFlowProps = {
  value: Value;
  trend?: boolean;
  className?: string;
  locale?: string;
  maximumFractionDigits?: number;
};

export default function NumberFlow({
  value,
  trend = false,
  className,
  locale = "en-US",
  maximumFractionDigits = 0,
}: NumberFlowProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    const duration = 600;
    const startTime = performance.now();
    let frameId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = startValue + (endValue - startValue) * eased;
      setDisplayValue(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        previousValueRef.current = endValue;
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  const formatted = useMemo(() => {
    return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(displayValue);
  }, [displayValue, locale, maximumFractionDigits]);

  return (
    <span className={className} data-trend={trend ? "on" : "off"}>
      {formatted}
    </span>
  );
}
