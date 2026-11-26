"use client"
import { useId, forwardRef, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  className?: string
  placeholder?: string
  label?: string
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ value, onChange, options, disabled, className, placeholder, label }, ref) => {
    const [open, setOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuId = useId()

    const handleSelect = (optionValue: string) => {
      onChange(optionValue)
      setOpen(false)
    }

    const selectedOption = options.find(o => o.value === value)

    return (
      <div className={cn("relative inline-block", className)}>
        <label id={`${menuId}-label`} className="sr-only">{label ?? "Seleccionar"}</label>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(!open)}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={menuId}
          aria-labelledby={`${menuId}-label`}
          className={cn(
            "w-full px-3 py-2 text-sm text-text-primary rounded-md border border-border bg-surface",
            "hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {selectedOption?.label ?? placeholder}
        </button>

        {open && (
          <div
            id={menuId}
            role="listbox"
            aria-labelledby={`${menuId}-label`}
            className={cn(
              "absolute z-20 w-48 mt-2 origin-top-left rounded-md bg-surface border border-border shadow-lg",
              "overflow-hidden ring-1 divide-y divide-border animate-in fade-in slide-in-from-top-0"
            )}
          >
            {options.map(option => (
              <button
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                disabled={disabled}
                className={cn(
                  "flex w-full px-3 py-2 text-sm text-text-primary hover:bg-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  option.value === value && "bg-primary/10 text-text-primary",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Dropdown.displayName = "Dropdown"