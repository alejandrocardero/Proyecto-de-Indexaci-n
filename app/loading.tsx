export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="flex flex-col items-center justify-center gap-3">
        <span className="spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-text-secondary text-sm">
          Cargando…
        </p>
      </div>
    </main>
  );
}
