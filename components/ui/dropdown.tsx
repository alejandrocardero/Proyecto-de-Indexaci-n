import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

/**
 * Dropdown component with surface background, border, radius, and shadow for menu.
 *
 * All styles derived from design tokens (design-tokens.json / variables.css).
 * No hardcoded hex values, no !important, no arbitrary spacing.
 *
 * @param props - Dropdown properties
 * @returns JSX Dropdown element
 */
interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const Dropdown = ({
  value,
  onChange,
  options,
  disabled = false,
  className,
  placeholder = "Seleccionar",
}: DropdownProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: { label: string; value: string }) => {
    onChange(option.value);
    setOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);

  const classes = cn(
    // Fondo surface
    "bg-surface",
    // Borde: border color-border, radius radius-md
    "border border-border rounded-md",
    // Sombra del menú desplegado: shadow-lg
    "shadow-lg",
    // State classes
    open ? "z-20" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  );

  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          "w-full px-3 py-2 text-sm text-text-primary rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
          "bg-surface text-text-primary hover:bg-primary/5",
          classes,
        )}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Selector"
      >
        {selectedOption?.label ?? placeholder}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-20 w-48 mt-2 origin-top-left rounded-md bg-surface border border-border shadow-lg overflow-hidden ring-1 divide-y divide-border",
            "animate-in fade-in slide-in-from-top-0",
            classes,
          )}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={cn(
                "flex w-full px-3 py-2 text-sm text-text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "hover:text-text-primary",
                disabled && "opacity-50 cursor-not-allowed",
                open && option.value === value && "bg-primary/10 text-text-primary",
              )}
              disabled={disabled}
              role="option"
              aria-selected={option.value === value}
              aria-pressed={open}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Dropdown option hover style.
 */
export const DropdownOption = ({
  isSelected,
  onSelect,
  children,
}: {
  isSelected?: boolean;
  onSelect: () => void;
  children: ReactNode;
}) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full px-3 py-2 text-sm text-text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isSelected && "bg-primary/10 text-text-primary",
      )}
    >
      {children}
    </button>
  );
};