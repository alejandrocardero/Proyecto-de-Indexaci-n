import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Indexación multimodal",
    description:
      "Extrae texto de PDF, imágenes y escaneados con OCR y visión por computadora.",
  },
  {
    title: "Búsqueda inteligente",
    description:
      "Encuentra documentos por contenido, fecha o tipo de archivo en segundos.",
  },
  {
    title: "Gestión de permisos",
    description:
      "Controla quién ve qué documento con roles y niveles de acceso.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background page-enter">
      {/* Hero section - centrado y compacto */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block bg-primary/10 text-primary text-[0.75rem] font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            MiPymes
          </span>
          <h1 className="font-display clamp(2rem, 5vw, 3rem) font-bold text-text-primary mb-4 leading-tight">
            Tu archivo de oficina, sin papeles sueltos
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Sube, busca y organiza facturas, contratos y permisos en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" className="text-base py-2.5 px-8">
              Subir primer documento
            </Button>
            <Button variant="outline" className="text-base py-2.5 px-8">
              Ver cómo funciona
            </Button>
          </div>
        </div>

        <div className="absolute right-0 top-1/6 -translate-y-1/4 hidden sm:block lg:block">
          <div className="bg-primary/5 border border-primary/20 rounded-full blur-[80px] h-48 w-48"></div>
        </div>
      </div>

      {/* Stats section - cards en 0, compacto */}
      <section className="bg-surface border border-border rounded-xl py-12 mb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Documentos indexados", value: "0" },
              { label: "Búsquedas por mes", value: "0" },
              { label: "Horas ahorradas", value: "0" },
            ].map((stat) => (
              <Card
                key={stat.label}
                variant="hoverable"
                className="p-6 text-center animate-in slide-up transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <p className="text-text-secondary text-[0.75rem] mb-2 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-display font-bold text-text-primary">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features section - centrado y compacto */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
            Todo lo que tu archivo necesita
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto text-base">
            Herramientas diseñadas para MiPymes que gestionan documentos sin
            departamento de sistemas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              variant="hoverable"
              className="p-6 h-full animate-in slide-up transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary mx-auto">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2 text-base">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA section - texto pequeño + botón independiente */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <h2 className="font-display text-lg sm:text-xl font-bold text-text-primary mb-2">
          ¿Listo para organizar tu archivo?
        </h2>
        <p className="text-text-secondary text-sm mb-8 max-w-lg mx-auto">
          Crea tu cuenta gratuita y sube tu primer documento en menos de dos
          minutos.
        </p>
        <div className="flex justify-center">
          <Button variant="primary" className="text-base py-2.5 px-8">
            Crear cuenta gratis
          </Button>
        </div>
      </section>
    </main>
  );
}
