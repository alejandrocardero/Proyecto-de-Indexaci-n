import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

/**
 * Navigation component with primary color, text-primary, font-weight-medium, spacing-3.
 * Mobile hamburger menu, horizontal desktop.
 *
 * All styles derived from design tokens (design-tokens.json / variables.css).
 * No hardcoded hex values, no !important, no arbitrary spacing.
 *
 * @param props - Nav properties
 * @returns JSX Nav element
 */
interface NavProps {
  brand?: string;
  links: { label: string; href: string }[];
  className?: string;
  mobile?: boolean;
}

export const Nav = ({
  brand = "MiPymes",
  links,
  className,
  mobile = false,
}: NavProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(mobile);
  const desktopClasses = cn(
    // Color: color-primary, color-text-primary
    "text-text-primary",
    "font-medium",
    // Spacing: spacing-3
    "space-x-3",
    // Hover states
    "hover:text-primary",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    // Active state
    "active:text-primary",
    // Transition
    "transition-colors duration-200 ease-out",
    // No underline
    "underline-none",
    className,
  );

  const mobileButtonClasses = cn(
    "block p-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "transition-colors duration-200 ease-out",
    className,
  );

  const linkClasses = cn(
    "inline-block p-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "transition-colors duration-200 ease-out",
    className,
  );

  return (
    <nav className={cn("bg-surface border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between h-16">
          <span className={cn("text-text-primary font-medium", className)}>
            {brand}
          </span>

          <div className="hidden md:block">
            <div className={desktopClasses}>
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={linkClasses}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className={cn(
              "md:hidden p-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "transition-colors duration-200 ease-out",
              "order-2 md:order-1",
              className,
            )}
            aria-label="Menú principal"
          >
            <span className="inline-block w-6 h-6 rounded-md">
              <svg
                className="w-4 h-4 text-text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 12l2-2m0 0l7-7m7 7l2 2m0 0l7 7m7-7v12a8 8 0 01-8 8H3a8 8 0 01-8-8v-12l7 7z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileOpen && (
          <div className="mt-4 space-y-2">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={cn(
                  "block p-3 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "transition-colors duration-200 ease-out",
                  className,
                )}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

/**
 * Nav link style for consistent navigation sub-component styling.
 */
export const NavLink = ({
  className,
  children,
  active,
}: {
  className?: string;
  children: ReactNode;
  active?: boolean;
}) => {
  return (
    <a
      className={cn(
        "relative inline-block py-2 px-0 text-text-primary font-medium",
        active && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:transition-all duration-200",
        "hover:text-primary",
        className,
      )}
    >
      {children}
    </a>
  );
};