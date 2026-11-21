"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log del error para monitoreo (Sentry, etc.)
    console.error("[Next.js Error Boundary]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="bg-surface border border-border shadow-xl rounded-2xl p-8 sm:p-10 text-center animate-in slide-up max-w-md w-full">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
          Algo salió mal
        </h1>
        <p className="text-text-secondary text-sm mb-6">
          Ocurrió un error inesperado en la aplicación.
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary w-full py-2.5 px-8 text-base font-medium rounded-md bg-primary text-surface hover:bg-primary-hover transition-colors"
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="mt-3 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  );
}
