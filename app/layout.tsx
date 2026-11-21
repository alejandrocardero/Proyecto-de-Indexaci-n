import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-local";
import { Navbar } from "@/components/Navbar";
import { BackToTop } from "@/components/layout/BackToTop";
import { ToastProvider } from "@/components/feedback/ToastProvider";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    template: "%s | MiPymes Indexación",
    default: "MiPymes — Indexación Multimodal",
  },
  description:
    "Servicio profesional de indexación multimodal para MiPymes. Sube, busca y organiza facturas, contratos y permisos en un solo lugar.",
  keywords: [
    "indexación documental",
    "MiPymes",
    "OCR",
    "gestión de documentos",
    "búsqueda inteligente",
    "archivo digital",
  ],
  authors: [{ name: "MiPymes" }],
  creator: "MiPymes",
  publisher: "MiPymes",
  robots: "index, follow",
  category: "business",
  openGraph: {
    title: "MiPymes — Indexación Multimodal",
    description:
      "Servicio profesional de indexación multimodal para MiPymes. Sube, busca y organiza facturas, contratos y permisos en un solo lugar.",
    url: siteUrl,
    siteName: "MiPymes",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "MiPymes Indexación Multimodal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiPymes — Indexación Multimodal",
    description:
      "Servicio profesional de indexación multimodal para MiPymes.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className="bg-background text-text-primary">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="page-enter pt-16 min-h-screen">{children}</main>
            <BackToTop />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
