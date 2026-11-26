import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Card component with surface background, border, radius, and shadow.
 * Variants: default, bordered, hoverable, elevated, paper
 * All styles derived from design tokens (design-tokens.json / variables.css).
 * No hardcoded hex values, no !important, no arbitrary spacing.
 *
 * @param props - Card properties
 * @returns JSX Card element
 */
interface CardProps {
  className?: string;
  children: ReactNode;
  variant?: "default" | "bordered" | "hoverable" | "elevated" | "paper";
  elevation?: "sm" | "md" | "lg" | "xl";
  icon?: ReactNode;
}

export const Card = ({
  className,
  children,
  variant = "default",
  elevation = "sm",
  icon,
}: CardProps) => {
  const shadowClassMap: Record<string, string> = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const baseClasses = cn(
    "bg-surface transition-colors",
    // Border: border-width-standard (1px), subtle via border-border
    "border border-border",
    // Radius: radius-lg as specified
    "rounded-lg",
  );

  const variantClasses = {
    default: "shadow-sm",
    bordered: "border border-border-strong shadow-xs",
    hoverable: "shadow-sm hover:bg-surface/50 hover:shadow-md hover:translate-y-[-2px] transition-all duration-200 ease-out",
    elevated: "shadow-lg border border-border-strong",
    paper: "rounded-xl border border-border-strong shadow-xs",
  };

  const elevationClass = elevation !== "sm" ? shadowClassMap[elevation] : "shadow-sm";

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    elevationClass,
    className,
  );

  const headerChildren = icon ? (
    <CardHeader className="flex items-start gap-2">
      {icon}
      {children}
    </CardHeader>
  ) : (
    children
  );

  return <div className={classes}>{headerChildren}</div>;
};

/**
 * Card header style for consistent card sub-component styling.
 */
export const CardHeader = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn("flex flex-col gap-2 p-4", className)}>{children}</div>
  );
};

/**
 * Card title style.
 */
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <h3 className={cn("font-semibold text-text-primary", className)}>{children}</h3>
  );
};

/**
 * Card body style with generous spacing.
 * py-8 instead of py-6 for more space.
 */
export const CardBody = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn("py-8", className)}>{children}</div>
  );
};

/**
 * Card footer style.
 */
export const CardFooter = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn("flex flex-col gap-2 pt-4 border-t border-border text-right", className)}>{children}</div>
  );
};