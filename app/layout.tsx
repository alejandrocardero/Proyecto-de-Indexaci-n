import { geistSans, geistMono, playfairDisplay } from "./fonts"
import { Providers } from "./providers"
import { ThemeToggle } from "@/components/theme-provider/theme-toggle"
import "./globals.css"

export const metadata = {
  title: "MiPymes — Indexación Multimodal",
  description: "Servicio profesional de indexación multimodal para MiPymes.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable}`}>
      <body className="bg-background text-text-primary font-sans antialiased">
        <Providers>
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>
          <header className="border-b border-border bg-surface">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
              <div className="flex items-center justify-between h-16">
                <span className="text-text-primary font-medium text-xl">MiPymes</span>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </header>
          <main id="main-content" className="page-enter">{children}</main>
        </Providers>
      </body>
    </html>
  )
}