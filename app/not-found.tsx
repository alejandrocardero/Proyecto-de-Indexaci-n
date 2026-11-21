import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="bg-surface border border-border shadow-xl rounded-2xl p-8 sm:p-10 text-center animate-in slide-up max-w-md w-full">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          Página no encontrada
        </h1>
        <p className="text-text-secondary text-sm mb-6">
          La página que buscas no existe o se ha movido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full sm:w-auto py-2.5 px-8 text-base font-medium rounded-md bg-primary text-surface hover:bg-primary-hover transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
