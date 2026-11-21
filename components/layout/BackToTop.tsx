"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <button
        onClick={scrollToTop}
        className="w-12 h-12 rounded-full bg-primary text-surface flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all duration-300 transform hover:scale-110"
        aria-label="Volver arriba"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </motion.div>
  );
}
