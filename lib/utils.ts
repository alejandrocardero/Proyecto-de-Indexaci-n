import { clsx } from "clsx";
import { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx.
 * Removes duplicates and conflicts using tailwind-merge.
 * All values are derived from design tokens (no hardcoded colors/sizes).
 *
 * @param inputs - Class names or objects to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a Tailwind class string for colors based on token names.
 * Maps token names to CSS variable classes.
 *
 * @param token - Color token name (e.g., "primary", "surface", "destructive")
 * @returns Tailwind CSS class
 */
export function colorClass(token: "primary" | "primary-hover" | "primary-light" | "secondary" | "success" | "warning" | "destructive" | "destructive-light" | "background" | "surface" | "border" | "text-primary" | "text-secondary" | "text-muted" | "inverse"): string {
  const mapping: Record<string, string> = {
    primary: "bg-primary text-primary",
    "primary-hover": "hover:bg-primary-hover hover:text-primary",
    "primary-light": "bg-primary-light",
    secondary: "bg-secondary text-secondary",
    success: "bg-success text-text-inverse",
    warning: "bg-warning text-text-inverse",
    destructive: "bg-destructive text-text-inverse",
    "destructive-light": "bg-destructive-light",
    background: "bg-background",
    surface: "bg-surface",
    border: "border-border",
    "text-primary": "text-text-primary",
    "text-secondary": "text-text-secondary",
    "text-muted": "text-text-muted",
    inverse: "bg-background text-text-inverse",
  };
  return mapping[token] || "";
}

/**
 * Generates Tailwind border width class from token.
 *
 * @param width - Border width token
 * @returns Tailwind CSS class
 */
export function borderWidthClass(width: "standard"): string {
  return width === "standard" ? "border-border" : "";
}

/**
 * Generates Tailwind radius class from token.
 *
 * @param radius - Border radius token name
 * @returns Tailwind CSS class
 */
export function radiusClass(radius: "sm" | "md" | "lg" | "xl"): string {
  const mapping: Record<string, string> = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  };
  return mapping[radius] || "rounded-md";
}

/**
 * Generates Tailwind shadow class from token.
 *
 * @param shadow - Shadow token name
 * @returns Tailwind CSS class
 */
export function shadowClass(shadow: "xs" | "sm" | "md" | "lg" | "xl"): string {
  const mapping: Record<string, string> = {
    xs: "shadow-xs",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };
  return mapping[shadow] || "shadow-sm";
}

/**
 * Motion class generator based on design tokens.
 * Respects prefers-reduced-motion via CSS variables.
 *
 * @param type - Motion type: "enter", "exit", "hover"
 * @returns Tailwind CSS transition class
 */
export function motionClass(type: "enter" | "exit" | "hover"): string {
  const mapping: Record<string, string> = {
    enter: "transition-transform duration-300 ease-out",
    exit: "transition-opacity duration-200 ease-out",
    hover: "transition-colors duration-150 ease-out",
  };
  return mapping[type] || "transition-colors duration-150 ease-out";
}

export default cn;