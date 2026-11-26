import { ReactNode } from "react"
import { Button } from "./button"

export interface EmptyStateProps {
  title: string
  subtitle?: string
  action?: ReactNode
  icon?: ReactNode
}

export const EmptyState = ({
  title,
  subtitle,
  action,
  icon,
}: EmptyStateProps) => {
  return (
    <div className="animate-in flex flex-col items-center gap-4 py-16">
      {icon ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-16 h-16 rounded-full bg-primary/10 backdrop-blur-lg flex items-center justify-center">
            {icon}
          </div>
          <span className="text-text-secondary text-sm">{subtitle || ""}</span>
        </div>
      ) : null}

      <div>
        <h3 className="font-sans text-lg font-semibold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-text-secondary">{subtitle}</p>
        )}
      </div>

      {action ? (
        <div className="flex gap-2">
          {typeof action === "string" ? (
            <Button variant="primary" size="sm" className="w-auto">
              {action}
            </Button>
          ) : (
            action
          )}
        </div>
      ) : null}
    </div>
  )
}