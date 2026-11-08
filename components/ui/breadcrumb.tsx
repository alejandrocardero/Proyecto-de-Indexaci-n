import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Breadcrumb component displaying horizontal navigation trail.
 * Uses CSS tokens via Tailwind classes — no hardcoded hex values.
 *
 * Props:
 *  items: Array<{ label: string, href?: string }> - breadcrumb items
 *  className?: string - additional Tailwind classes
 */
interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}

export const Breadcrumb = ({
  items,
  className,
}: BreadcrumbProps) => {
  const itemClasses = cn(
    "inline-flex items-center px-2 py-1",
    "gap-3",
    // Hover state for all items
    "hover:text-primary transition-colors duration-200 ease-out",
    "underline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    className,
  );

  return (
    <nav className={cn("animate-in flex items-center", className)} aria-label="Navegación">
      {items.map((item, index) => {
        // First item: text-primary, rest: text-secondary
        const textClass = index === 0 ? "text-text-primary" : "text-text-secondary";

        // Separator before every item except the first
        const separator = index > 0 ? (
          <span className="align-baseline text-text-secondary">/</span>
        ) : null;

        if (item.href) {
          return (
            <a
              key={item.label}
              href={item.href}
              className={cn(itemClasses, textClass)}
            >
              {item.label}
            </a>
          );
        }

        return (
          <span key={item.label} className={cn(itemClasses, textClass)}>
            {item.label}
          </span>
        );
      })}
    </nav>
  );
};