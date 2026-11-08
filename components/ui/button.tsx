import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Button component with multiple variants and full state support.
 *
 * Variants: primary, secondary, success, warning, destructive, ghost, outline
 * Sizes: sm, md, lg
 * States: default, hover, focus-visible, active, disabled, loading
 * AsChild: optional prop to render child element type
 *
 * All styles derived from design tokens (design-tokens.json / variables.css).
 * No hardcoded hex values, no !important, no arbitrary spacing.
 *
 * @param props - Button properties
 * @returns JSX Button element
 */
interface ButtonProps {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Button = ({
  asChild = false,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  children,
  className,
  onClick,
}: ButtonProps) => {
  const baseClasses = cn(
    // Base layout
    "inline-flex items-center justify-center rounded-md font-medium",
    // Sizes
    size === "sm"
      ? "h-8 px-2 text-sm"
      : size === "lg"
      ? "h-10 px-4 text-lg"
      : "h-9 px-3 text-base",
    // Transitions: color + transform, GPU-safe properties only
    "transition-colors duration-200 ease-out",
    "transition-transform duration-160 ease-out",
    // Focus ring
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    // Disabled state
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // Custom className
    className,
  );

  const variantClasses = {
    primary:
      "bg-primary text-surface hover:bg-primary-hover active:scale-[0.97]",
    secondary:
      "bg-secondary text-text-inverse hover:bg-secondary-hover active:scale-[0.97]",
    success:
      "bg-success text-text-inverse hover:bg-success/90 active:scale-[0.97]",
    warning:
      "bg-warning text-text-inverse hover:bg-warning/90 active:scale-[0.97]",
    destructive:
      "bg-destructive text-text-inverse hover:bg-destructive-hover active:scale-[0.97]",
    ghost:
      "bg-transparent text-primary hover:bg-primary/5 active:scale-[0.97]",
    outline:
      "border border-primary text-primary hover:bg-primary/10 active:scale-[0.97]",
  } as const;

  const Component = asChild ? "span" : "button";

  if (disabled && !loading) {
    return (
      <Component
        className={cn(baseClasses, variantClasses[variant])}
        disabled
        aria-disabled="true"
        title="Deshabilitado"
        type={type}
      >
        {children}
      </Component>
    );
  }

  if (loading) {
    return (
      <Component
        className={cn(baseClasses, variantClasses[variant])}
        disabled
        aria-busy="true"
        title="Cargando"
        type={type}
      >
        <span className="flex items-center gap-2">
          <span className="spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      </Component>
    );
  }

  return (
    <Component
      className={cn(baseClasses, variantClasses[variant])}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </Component>
  );
};

export const buttonVariants = {
  primary: "bg-primary text-surface hover:bg-primary-hover active:scale-[0.97]",
  secondary: "bg-secondary text-text-inverse hover:bg-secondary-hover active:scale-[0.97]",
  success: "bg-success text-text-inverse hover:bg-success/90 active:scale-[0.97]",
  warning: "bg-warning text-text-inverse hover:bg-warning/90 active:scale-[0.97]",
  destructive: "bg-destructive text-text-inverse hover:bg-destructive-hover active:scale-[0.97]",
  ghost: "bg-transparent text-primary hover:bg-primary/5 active:scale-[0.97]",
  outline: "border border-primary text-primary hover:bg-primary/10 active:scale-[0.97]",
} as const;