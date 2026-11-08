import { cn } from "@/lib/utils";
import React from "react";
import { ReactNode } from "react";

/**
 * Toast component with color-primary/success/destructive over surface, positioned at corner.
 *
 * All styles derived from design tokens (design-tokens.json / variables.css).
 * No hardcoded hex values, no !important, no arbitrary spacing.
 *
 * @param props - Toast properties
 * @returns JSX Toast element
 */
interface ToastProps {
  variant?: "primary" | "success" | "destructive";
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  duration?: number;
}

type ToastItem = ToastProps & { id: string };

const toastContainerClasses = cn(
  "fixed z-50 max-w-sm right-4 top-4",
  "rounded-lg border border-border bg-surface shadow-lg p-4 shadow-xl",
  "transition-all duration-200 ease-out",
);

const toastVariantClasses = {
  primary: cn("border border-primary/20 text-primary"),
  success: cn("border border-success/20 text-success"),
  destructive: cn("border border-destructive/20 text-destructive"),
} as const;

const toastCloseButtonClasses = cn(
  "absolute right-2 top-2 rounded-full bg-surface/5 hover:bg-surface/10 p-2 transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
);

export const Toast = ({
  variant = "primary",
  title,
  description,
  className,
  duration = 5000,
}: ToastProps) => {
  const [isVisible, setIsVisible] = React.useState(true);

  // Auto-hide after duration
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration, isVisible]);

  return (
    <div
      className={cn(toastContainerClasses, className, isVisible ? "opacity-100" : "opacity-0")}
      role="alert"
      aria-live="polite"
    >
      <div className={cn("flex items-start gap-3", toastVariantClasses[variant])}>
        {/* Icon/Indicator */}
        <div className="flex-shrink-0 flex items-center justify-center w-3 h-3 rounded-md">
          {variant === "primary" && (
            <svg className="w-2 h-2 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 19l-4-4L8 6l6-6" />
            </svg>
          )}
          {variant === "success" && (
            <svg className="w-2 h-2 text-success" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5v.01M12 12v.01M12 19v.01M17 2l-7 7-7-7" />
            </svg>
          )}
          {variant === "destructive" && (
            <svg className="w-2 h-2 text-destructive" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l6-6 6 6-6 6z" />
            </svg>
          )}
        </div>

        <div className="flex-1 pt-0.5">
          {title && (
            <p className="font-medium text-text-primary">{title}</p>
          )}
          {description && (
            <p className="text-text-secondary text-sm line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className={toastCloseButtonClasses}
        aria-label="Cerrar notificación"
      >
        <svg
          className="w-3 h-3 text-text-muted"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Toast wrapper that manages multiple toasts.
 */
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = (props: Omit<ToastProps, "className">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...props, id } as ToastItem]);
    return id;
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toast, dismiss };
};