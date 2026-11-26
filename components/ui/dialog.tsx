"use client"
import { forwardRef, useEffect, useRef, useId } from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, title, children, className }, forwardedRef) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const triggerRef = useRef<HTMLElement>(null)
    const titleId = useId()

    // Forward the ref to the dialog element
    useEffect(() => {
      if (forwardedRef && typeof forwardedRef === "object") {
        forwardedRef.current = dialogRef.current
      }
    }, [forwardedRef])

    useEffect(() => {
      const dialog = dialogRef.current
      if (!dialog) return
      if (open && !dialog.open) {
        triggerRef.current = document.activeElement as HTMLElement
        dialog.showModal()
      } else if (!open && dialog.open) {
        dialog.close()
      }
    }, [open])

    useEffect(() => {
      const dialog = dialogRef.current
      if (!dialog) return
      const onCloseHandler = () => {
        onClose()
        triggerRef.current?.focus()
      }
      dialog.addEventListener("close", onCloseHandler)
      return () => dialog.removeEventListener("close", onCloseHandler)
    }, [onClose])

    return (
      <dialog
        ref={dialogRef}
        className={cn(
          "bg-surface border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4",
          className
        )}
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <h2 id={titleId} className="text-lg font-semibold text-text-primary mb-4">
            {title}
          </h2>
        )}
        <div className="flex flex-col gap-4">
          {children}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cerrar
            </button>
          </div>
        </div>
        <form method="dialog" className="hidden">
          <button type="submit">Close</button>
        </form>
      </dialog>
    )
  }
)
Dialog.displayName = "Dialog"