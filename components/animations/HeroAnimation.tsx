"use client";

import { motion } from "framer-motion";

export function HeroAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

export function HeroStagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.6,
          staggerChildren: 0.15,
          delayChildren: 0.2,
        },
      }}
    >
      {children}
    </motion.div>
  );
}
