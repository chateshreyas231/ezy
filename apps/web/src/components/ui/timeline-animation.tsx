"use client";

import { type HTMLAttributes, type ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";

type TimelineContentProps = {
  children: ReactNode;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement | null>;
  customVariants?: {
    visible?: ((i: number) => Record<string, unknown>) | Record<string, unknown>;
    hidden?: Record<string, unknown>;
  };
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
  const visible = customVariants?.visible ?? ((i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.45 } }));
  const hidden = customVariants?.hidden ?? { opacity: 0, y: 16 };

  return (
    <motion.div
      ref={localRef as never}
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: typeof visible === "function" ? visible : () => visible,
        hidden,
      }}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}
