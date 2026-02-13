"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

function CountAnimation({
  number,
  className,
}: {
  number: number;
  className: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, number, { duration: 0.5 });
    return animation.stop;
  }, [count, number]);

  return <motion.h1 className={cn(className)}>{rounded}</motion.h1>;
}

export { CountAnimation };
