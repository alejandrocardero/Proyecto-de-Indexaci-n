import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton component for loading states.
 * All colors and styles derived from design tokens (variables.css).
 * No hardcoded hex values, no !important.
 */
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  radius: "sm" | "md" | "lg" | "full";
}

export const Skeleton = ({
  className,
  width = "full",
  height = "1rem",
  radius,
}: SkeletonProps) => {
  const radiusMap: Record<string, string> = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const widthClass =
    typeof width === "number" ? `${width}px` : width === "full" ? "w-full" : `${width}`;

  const heightClass =
    typeof height === "number" ? `${height}px` : `${height}`;

  return (
    <div
      className={cn(
        "bg-surface/30 animate-pulse-custom min-h-[1rem]",
        radius === "full" ? "rounded-full" : `rounded-${radius}`,
        className,
      )}
      style={{ width: widthClass, height: heightClass }}
    />
  );
};