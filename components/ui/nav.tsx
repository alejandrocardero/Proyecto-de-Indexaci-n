"use client"
import { cn } from "@/lib/utils"
import { ReactNode, useState, useRef, useEffect, useId } from "react"

interface NavProps {
  brand?: string
  links: { label: string; href: string }[]
  className?: string
  mobile?: boolean
}

export const Nav = ({
  brand = "MiPymes",
  links,
  className,
  mobile = false,
}: NavProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    const main = document.getElementById("main-content")
    if (!main) return

    const handleOpen = () => {
      main.setAttribute("inert", "")
      const focusable = panelRef.current?.querySelector("a, button")
      if (focusable) (focusable as HTMLElement).focus()
    }

    const handleClose = () => {
      main.removeAttribute("inert")
      buttonRef.current?.focus()
    }

    if (isMobileOpen) {
      handleOpen()
    } else {
      handleClose()
    }

    return () => main.removeAttribute("inert")
  }, [isMobileOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false)
        buttonRef.current?.focus()
      }
    }
    if (isMobileOpen) window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isMobileOpen])

  const desktopClasses = cn(
    "text-text-primary",
    "font-medium",
    "space-x-3",
    "hover:text-primary",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "active:text-primary",
    "transition-colors duration-200 ease-out",
    "underline-none",
    className,
  )

  const mobileButtonClasses = cn(
    "block p-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "transition-colors duration-200 ease-out",
    className,
  )

  const linkClasses = cn(
    "inline-block p-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "transition-colors duration-200 ease-out",
    className,
  )

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
                  key={link.href}
                  href={link.href}
                  className={linkClasses}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {mobile && (
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-expanded={isMobileOpen}
              aria-controls={panelId}
              aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
              className={cn(
                "md:hidden p-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "transition-colors duration-200 ease-out",
                "order-2 md:order-1",
                className,
              )}
            >
              <span className="inline-block w-6 h-6 rounded-md">
                <svg
                  className="w-4 h-4 text-text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {isMobileOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M3 12l2-2m0 0l7-7m7 7l2 2m0 0l7 7m7-7v12a8 8 0 01-8 8H3a8 8 0 01-8-8v-12l7 7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </span>
            </button>
          )}
        </div>

        {mobile && isMobileOpen && (
          <div
            ref={panelRef}
            id={panelId}
            role="navigation"
            aria-label="Menú principal"
            className="md:hidden fixed inset-0 z-50 bg-surface p-4"
          >
            <ul className="flex flex-col gap-2">
              {links.map((link, index) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block p-3 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}

export const NavLink = ({
  className,
  children,
  active,
}: {
  className?: string
  children: ReactNode
  active?: boolean
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
  )
}