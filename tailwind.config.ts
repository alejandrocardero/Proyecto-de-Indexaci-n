import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-light": "var(--color-primary-light)",
        secondary: "var(--color-secondary)",
        "secondary-hover": "var(--color-secondary-hover)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        "warning-hover": "var(--color-warning-hover)",
        destructive: "var(--color-destructive)",
        "destructive-hover": "var(--color-destructive-hover)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-inverse": "var(--color-text-inverse)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-playfair-display)", "Georgia", "serif"],
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
      },
      ringWidth: {
        3: "3px",
      },
      borderWidth: {
        1: "1px",
      },
      transitionDuration: {
        160: "160ms",
      },
      top: {
        "1/6": "16.666%",
      },
      textDecoration: {
        none: "none",
      },
    },
  },
  plugins: [],
}

export default config