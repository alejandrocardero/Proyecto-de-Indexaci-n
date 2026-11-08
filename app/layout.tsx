import "./globals.css";

export const metadata = {
  title: "MiPymes — Indexación Multimodal",
  description: "Servicio profesional de indexación multimodal para MiPymes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-background text-text-primary">
        <main className="page-enter">{children}</main>
      </body>
    </html>
  );
}
