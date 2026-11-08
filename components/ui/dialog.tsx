import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

/**
 * Dialog component with surface background, border, radius, shadow, and backdrop.
 *
 * All styles derived from design tokens (design-tokens.json / variables.css).
 * No hardcoded hex values, no !important, no arbitrary spacing.
 *
 * @param props - Dialog properties
 * @returns JSX Dialog element
 */
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const Dialog = ({
  open,
  onClose,
  title,
  children,
  className,
  onKeyDown,
}: DialogProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (onKeyDown) onKeyDown(e);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const classes = cn(
    // Fondo surface
    "bg-surface",
    // Borde: border color-border, radius radius-lg
    "border border-border rounded-lg",
    // Sombra: shadow-xl
    "shadow-xl",
    // Overlay backdrop blur usando variable CSS --color-overlay
    "fixed inset-0 z-50 flex items-center justify-center",
    "bg-surface/50 backdrop-blur-sm",
    // Dialog container with slide + fade transition
    "relative w-full max-w-md mx-4",
    open
      ? "transition-opacity duration-200 ease-out opacity-100 translate-y-0"
      : "transition-opacity duration-200 ease-out opacity-0 translate-y-2",
    className,
  );

  return (
    <div
      className={classes}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      <div className="relative rounded-lg bg-surface p-6 w-full shadow-xl">
        {title && (
          <h2 id="dialog-title" className="text-lg font-semibold text-text-primary mb-4">
            {title}
          </h2>
        )}
        <div className="flex flex-col gap-4">
          {children}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cerrar"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dialog overlay that covers the screen.
 */
export const DialogOverlay = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-surface/50 backdrop-blur-sm",
        className,
      )}
    />
  );
};

/**
 * Dialog content area with consistent padding and styling.
 */
export const DialogContent = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn("bg-surface rounded-lg p-6 w-full max-w-md shadow-xl", className)}>{children}</div>
  );
};