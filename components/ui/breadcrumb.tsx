import { cn } from "@/lib/utils"
import { ReactNode, Fragment } from "react"

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>
  className?: string
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const itemClasses = cn(
    "inline-flex items-center px-2 py-1",
    "gap-3",
    "hover:text-primary transition-colors duration-200 ease-out",
    "underline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    className,
  )

  return (
    <nav className={cn("animate-in flex items-center", className)} aria-label="Navegación">
      <ol className="flex items-center gap-1 list-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <Fragment key={item.href ?? item.label ?? index}>
              <li>
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(itemClasses, isLast ? "text-text-primary" : "text-text-secondary")}
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className={cn(itemClasses, "text-text-secondary hover:text-primary")}
                  >
                    {item.label}
                  </a>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="text-text-muted select-none">/</li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}