import { cn } from "@/lib/utils";
import { ReactNode, useId } from "react";

/**
 * Search input component con superficie, borde y anillo de foco.
 * Todos los estilos derivados de design tokens (design-tokens.json / variables.css).
 * Sin valores hex hardcodeados, sin !important, sin espaciado arbitrario.
 *
 * @param props - SearchInput properties
 * @returns JSX SearchInput element
 */
interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: ReactNode;
}

export const SearchInput = ({
  placeholder = "Buscar documentos…",
  value,
  onChange,
  disabled = false,
  className,
  label,
}: SearchInputProps) => {
  const inputId = useId();

  const classes = cn(
    // Fondo: color-surface
    "bg-surface",
    // Borde: border color-border, radius radius-sm
    "border border-border rounded-sm",
    // Focus: color-primary ring (ámbar vía var(--color-primary))
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    // Font size: font-size-sm
    "text-sm",
    // Padding: space-3 space-4
    "px-3 py-2",
    // Transition
    "transition-colors duration-200 ease-out",
    // Disabled state
    disabled && "opacity-50 cursor-not-allowed",
    // Custom className
    className,
  );

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary pointer-events-none"
        >
          {label}
        </label>
      )}
      <input
        type="search"
        id={inputId}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange?.(e.target.value);
        }}
        className={classes}
        disabled={disabled}
        aria-label="Búsqueda de documentos"
      />
    </div>
  );
};