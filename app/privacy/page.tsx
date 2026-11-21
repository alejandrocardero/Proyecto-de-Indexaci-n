import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | MiPymes",
  description: "Política de privacidad de MiPymes — Indexación Multimodal",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal variant="fade" once className="mb-8">
          <nav className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </nav>
        </ScrollReveal>

        <ScrollReveal variant="slide-up" once>
          <div className="bg-surface border border-border shadow-xl rounded-2xl p-6 sm:p-8 lg:p-12 animate-in slide-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
                Política de Privacidad
              </h1>
              <p className="text-text-secondary text-sm">
                Última actualización: 20 de noviembre de 2026
              </p>
            </div>

            <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
              <section className="scroll-reveal-item">
                <h2 className="font-semibold text-text-primary text-lg mb-3">1. ¿Quiénes somos?</h2>
                <p>
                  MiPymes es un servicio profesional de indexación multimodal para micro, pequeñas y medianas empresas.
                  Esta política explica cómo recopilamos, usamos y protegemos tu información personal.
                </p>
              </section>

              <section className="scroll-reveal-item">
                <h2 className="font-semibold text-text-primary text-lg mb-3">2. Información que recopilamos</h2>
                <ul className="list-disc list-inside space-y-3">
                  <li>Datos de cuenta: nombre, correo electrónico y contraseña (cifrada).</li>
                  <li>Documentos subidos: archivos y metadatos (nombre, tamaño, tipo, fecha).</li>
                  <li>Datos de uso: interacciones con la plataforma para mejorar el servicio.</li>
                </ul>
              </section>

              <section className="scroll-reveal-item">
                <h2 className="font-semibold text-text-primary text-lg mb-3">3. Uso de la información</h2>
                <p>
                  Usamos tus datos para: permitir el acceso a tu cuenta, procesar y indexar tus documentos,
                  ofrecerte búsqueda inteligente y comunicarnos contigo sobre el servicio.
                </p>
              </section>

              <section className="scroll-reveal-item">
                <h2 className="font-semibold text-text-primary text-lg mb-3">4. Compartición de datos</h2>
                <p>
                  No compartimos tu información personal con terceros, excepto cuando sea necesario para operar
                  el servicio (proveedores de almacenamiento o infraestructura bajo confidencialidad).
                </p>
              </section>

              <section className="scroll-reveal-item">
                <h2 className="font-semibold text-text-primary text-lg mb-3">5. Seguridad</h2>
                <p>
                  Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado,
                  alteración, divulgación o destrucción. Tus contraseñas se almacenan de forma cifrada.
                </p>
              </section>

              <section className="scroll-reveal-item">
                <h2 className="font-semibold text-text-primary text-lg mb-3">6. Tus derechos</h2>
                <p>
                  Puedes acceder, corregir o eliminar tu información personal en cualquier momento escribiéndonos
                  o desde la configuración de tu cuenta.
                </p>
              </section>

              <section className="scroll-reveal-item">
                <h2 className="font-semibold text-text-primary text-lg mb-3">7. Contacto</h2>
                <p>
                  Si tienes preguntas sobre esta política, contáctanos a través de los canales oficiales de la plataforma.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full sm:w-auto py-3 px-8 text-base font-medium rounded-xl bg-primary text-surface hover:bg-primary-hover transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
