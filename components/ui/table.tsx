import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"

interface TableProps {
  className?: string
  children: ReactNode
  striped?: boolean
  highlight?: string
  caption?: string
}

export const Table = ({
  className,
  children,
  striped = false,
  highlight = "primary",
  caption,
}: TableProps) => {
  const tableClasses = cn(
    "w-full rounded-md border border-border",
    "bg-background",
    "border border-border",
    "text-sm",
    "hover:bg-primary/5 transition-colors",
    className,
  )

  const headerRowClasses = cn(
    "bg-secondary/5 border-b border-border",
    "text-text-secondary font-medium text-xs tracking-wider",
  )

  const highlightCellClasses = cn(
    "bg-primary/5 text-primary hover:bg-primary/10",
  )

  const childrenArray = React.Children.toArray(children)
  const headerChildren = childrenArray.filter(
    (child) => (child as any).type === TableHeader,
  )
  const rowChildren = childrenArray.filter(
    (child) => (child as any).type === TableRow,
  )

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          {headerChildren.map((col: any, i: number) => (
            <tr key={i} className={headerRowClasses}>
              {React.Children.toArray(col.children).map((cell: any, ci: number) => (
                <th key={ci} scope="col" className={headerRowClasses} colSpan={cell.props.colSpan || 1}>
                  {cell.props.children}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rowChildren.map((row: any, rowIndex: number) => {
            const isHighlight = highlight && rowIndex % 2 === 0
            return (
              <tr
                key={rowIndex}
                className={cn(
                  "bg-background hover:bg-primary/5 transition-colors",
                  isHighlight && "bg-primary/5",
                )}
              >
                {React.Children.toArray(row.children).map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className="px-3 py-2 border-b border-border text-left align-middle">
                    {cell.props.children}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export const TableHeader = ({
  className,
  children,
  colSpan = 1,
}: {
  className?: string
  children: ReactNode
  colSpan?: number
}) => {
  return (
    <th className={cn("px-3 py-2 border-b border-border text-left text-xs font-medium uppercase tracking-wider", className)} colSpan={colSpan}>
      {children}
    </th>
  )
}

export const TableCell = ({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) => {
  return (
    <td className={cn("px-3 py-2 border-b border-border text-left align-middle", className)}>
      {children}
    </td>
  )
}

export const TableRow = ({
  className,
  children,
  highlight = false,
}: {
  className?: string
  children: ReactNode
  highlight?: boolean
}) => {
  const rowClasses = cn(
    "hover:bg-primary/5 transition-colors",
    highlight && "bg-primary/5",
  )
  return (
    <tr className={cn(rowClasses, className)}>
      {children}
    </tr>
  )
}