import { cn } from "@/lib/utils";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ReactNode } from "react";

/**
 * Toast component with color-primary/success/destructive over surface, positioned at corner.
 *
 * All styles derived from design tokens (design-tokens.json / variables.css).
 * No hardcoded hex values, no !important, no arbitrary spacing.
 */

interface ToastProps {
  variant?: "primary" | "success" | "destructive";
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  duration?: number;
}

export type ToastOptions = Omit<ToastProps, "className">;

type ToastItem = ToastOptions & { id: string };

const toastContainerClasses = cn(
  "relative w-full max-w-sm",
  "rounded-lg border border-border bg-surface shadow-xl p-4",
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
  onDismiss,
}: ToastProps & { onDismiss?: () => void }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const dismissedRef = useRef(false);

  // Auto-hide after duration, then notify parent so it can be removed from the list
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (!dismissedRef.current) {
        dismissedRef.current = true;
        onDismiss?.();
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={cn(toastContainerClasses, className, isVisible ? "opacity-100" : "opacity-0 pointer-events-none")}
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
          {title && <p className="font-medium text-text-primary">{title}</p>}
          {description && (
            <p className="text-text-secondary text-sm line-clamp-2">{description}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          if (!dismissedRef.current) {
            dismissedRef.current = true;
            onDismiss?.();
          }
        }}
        className={toastCloseButtonClasses}
        aria-label="Cerrar notificación"
      >
        <svg className="w-3 h-3 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

interface ToastContextValue {
  toast: (props: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Renders a stack of toasts in the top-right corner and exposes `toast()` / `dismiss()`.
 * Must wrap any component that calls `useToast()`.
 */
export function ToastViewportProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((props: ToastOptions) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts((prev) => [...prev, { ...props, id }]);
    return id;
  }, []);

  const value = React.useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed z-50 top-4 right-4 flex flex-col gap-2 items-end pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback keeps components working even if mounted outside the provider
    // (no-op toasts instead of a crash).
    return { toast: () => "", dismiss: () => {} };
  }
  return ctx;
};
