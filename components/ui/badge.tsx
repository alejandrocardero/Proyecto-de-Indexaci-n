import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Badge component con variantes semánticas para estados, categorías y alertas.
 * Todas las variantes usan tokens de diseño, sin hex hardcodeados.
 *
 * @param props - Badge properties
 * @returns JSX Badge element
 */
interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "surface-on-primary";
  children: ReactNode;
  className?: string;
}

export const Badge = ({
  variant = "primary",
  children,
  className,
}: BadgeProps) => {
  const classes = cn(
    // Base styles
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
    // Variants
    variant === "primary"
      ? "bg-primary-light text-primary-hover"
      : variant === "secondary"
      ? "bg-surface/50 text-text-secondary border border-border"
      : variant === "success"
      ? "bg-success/10 text-success"
      : variant === "warning"
      ? "bg-warning/10 text-warning/90"
      : variant === "destructive"
      ? "bg-destructive-light text-destructive"
      : variant === "surface-on-primary"
      ? "bg-surface text-primary"
      : "",
    // Custom className
    className,
  );

  return <span className={classes}>{children}</span>;
};

/**
 * Badge con ícono de cierre (×).
 */
export const CloseBadge = ({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}) => {
  return (
    <button
      onClick={onClose}
      className={cn("p-1 rounded-md hover:bg-primary/10", className, "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary")}
      aria-label="Cerrar"
    >
      <span className="inline-flex items-center justify-center w-3 h-3 text-text-muted">
        ×
      </span>
    </button>
  );
};