"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
];

interface LanguageSelectorProps {
  currentLang: string;
  onLangChange: (lang: string) => void;
  className?: string;
}

export function LanguageSelector({
  currentLang,
  onLangChange,
  className,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Seleccionar idioma"
      >
        <Globe className="w-4 h-4" />
        <span>{LANGUAGES.find((l) => l.code === currentLang)?.flag}</span>
        <span className="font-medium hidden sm:inline">
          {LANGUAGES.find((l) => l.code === currentLang)?.name}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-down"
          onMouseLeave={() => setIsOpen(false)}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLangChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
                currentLang === lang.code
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLang === lang.code && (
                <svg className="ml-auto w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
