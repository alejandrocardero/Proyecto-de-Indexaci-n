"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants, type TargetAndTransition } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "fade" | "slide-up" | "slide-down" | "zoom";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

const variants: Record<string, { hidden: TargetAndTransition; visible: TargetAndTransition }> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  },
  "slide-down": {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
  },
};

export function ScrollReveal({
  children,
  variant = "fade",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  once = true,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const animVariants: { hidden: TargetAndTransition; visible: TargetAndTransition } = {
    hidden: variants[variant].hidden,
    visible: {
      ...variants[variant].visible,
      transition: {
        ...(variants[variant].visible.transition as object),
        delay,
        duration,
      },
    },
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && !hasTriggered) {
            setHasTriggered(true);
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, once, hasTriggered]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={animVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
