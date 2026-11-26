import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = "primary", size = "md", disabled = false, loading = false, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-md font-medium",
      size === "sm" ? "h-8 px-2 text-sm" : size === "lg" ? "h-10 px-4 text-lg" : "h-9 px-3 text-base",
      "transition-colors duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )

    const variantClasses = {
      primary: "bg-primary text-surface hover:bg-primary-hover active:scale-[0.97]",
      secondary: "bg-secondary text-text-inverse hover:bg-secondary-hover active:scale-[0.97]",
      success: "bg-success text-text-inverse hover:bg-success/90 active:scale-[0.97]",
      warning: "bg-warning text-text-inverse hover:bg-warning/90 active:scale-[0.97]",
      destructive: "bg-destructive text-text-inverse hover:bg-destructive-hover active:scale-[0.97]",
      ghost: "bg-transparent text-primary hover:bg-primary/5 active:scale-[0.97]",
      outline: "border border-primary text-primary hover:bg-primary/10 active:scale-[0.97]",
    } as const

    if (disabled && !loading) {
      return (
        <Comp
          ref={ref}
          className={cn(baseClasses, variantClasses[variant])}
          disabled
          aria-disabled="true"
          {...props}
        >
          {children}
        </Comp>
      )
    }

    if (loading) {
      return (
        <Comp
          ref={ref}
          className={cn(baseClasses, variantClasses[variant])}
          disabled
          aria-busy="true"
          {...props}
        >
          <span className="flex items-center gap-2">
            <span className="spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        </Comp>
      )
    }

    return (
      <Comp
        ref={ref}
        className={cn(baseClasses, variantClasses[variant])}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export const buttonVariants = {
  primary: "bg-primary text-surface hover:bg-primary-hover active:scale-[0.97]",
  secondary: "bg-secondary text-text-inverse hover:bg-secondary-hover active:scale-[0.97]",
  success: "bg-success text-text-inverse hover:bg-success/90 active:scale-[0.97]",
  warning: "bg-warning text-text-inverse hover:bg-warning/90 active:scale-[0.97]",
  destructive: "bg-destructive text-text-inverse hover:bg-destructive-hover active:scale-[0.97]",
  ghost: "bg-transparent text-primary hover:bg-primary/5 active:scale-[0.97]",
  outline: "border border-primary text-primary hover:bg-primary/10 active:scale-[0.97]",
} as const