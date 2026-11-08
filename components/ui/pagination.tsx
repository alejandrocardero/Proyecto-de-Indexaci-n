import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Pagination component with previous/next buttons and page numbers.
 * Uses CSS tokens via Tailwind classes — no hardcoded hex values.
 *
 * Props:
 *  currentPage: number - current page number (1-indexed)
 *  totalPages: number - total number of pages
 *  onPageChange: (page: number) => void - callback when page changes
 *  className?: string - additional Tailwind classes
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const buttonClasses = cn(
    "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    className,
  );

  const pageClasses = cn(
    "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    className,
  );

  const activeClasses = cn(
    "bg-primary text-surface",
    pageClasses,
  );

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  const prevClasses = cn(
    buttonClasses,
    "hover:bg-primary/10",
    prevDisabled && "disabled:cursor-not-allowed disabled:opacity-50",
    "text-text-primary hover:text-primary",
  );

  const nextClasses = cn(
    buttonClasses,
    "hover:bg-primary/10",
    nextDisabled && "disabled:cursor-not-allowed disabled:opacity-50",
    "text-text-primary hover:text-primary",
  );

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className={cn("mt-4 flex", className)} aria-label="Paginación">
      <div className="flex items-center gap-2">
        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(prevClasses, "rounded-l-md")}
          disabled={prevDisabled}
          aria-label="Página anterior"
        >
          Anterior
        </button>

        {/* Números de página */}
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(pageClasses, isActive && activeClasses)}
              disabled={isActive}
            >
              {page}
            </button>
          );
        })}

        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(buttonClasses, "rounded-r-md")}
          disabled={nextDisabled}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
};