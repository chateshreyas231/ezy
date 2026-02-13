"use client";

import { type HTMLAttributes, type ReactNode, useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

type TimelineContentProps = {
  children: ReactNode;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement | null>;
  customVariants?: Variants;
} & HTMLAttributes<HTMLElement>;

export function TimelineContent({
  children,
  animationNum = 0,
  timelineRef,
  customVariants,
  ...props
}: TimelineContentProps) {
  const localRef = useRef<HTMLElement | null>(null);
  const inView = useInView(timelineRef ?? localRef, { amount: 0.2, once: true });
  const variants: Variants = customVariants ?? {
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.45 } }),
    hidden: { opacity: 0, y: 16 },
  };

  return (
    <motion.div
      ref={localRef as never}
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}
