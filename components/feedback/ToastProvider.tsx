"use client";

import { useCallback } from "react";
import { ToastViewportProvider, useToast } from "@/components/ui/toast";

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Global toast host. Renders the toast viewport (top-right stack) and
 * provides `useAppToast()` helpers to any descendant.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return <ToastViewportProvider>{children}</ToastViewportProvider>;
}

export const useAppToast = () => {
  const { toast } = useToast();

  const showSuccess = useCallback(
    (title: string, description?: string) => {
      toast({ variant: "success", title, description, duration: 4000 });
    },
    [toast]
  );

  const showError = useCallback(
    (title: string, description?: string) => {
      toast({ variant: "destructive", title, description, duration: 6000 });
    },
    [toast]
  );

  const showInfo = useCallback(
    (title: string, description?: string) => {
      toast({ variant: "primary", title, description, duration: 4000 });
    },
    [toast]
  );

  return { showSuccess, showError, showInfo };
};
