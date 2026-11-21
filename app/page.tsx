"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroAnimation, HeroStagger } from "@/components/animations/HeroAnimation";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { RepeatingCTA } from "@/components/layout/RepeatingCTA";
import { ProtectedButton } from "@/components/auth/ProtectedButton";
import { ArrowRight, FileText, Search, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Indexación multimodal",
    description:
      "Extrae texto de PDF, imágenes y escaneados con OCR y visión por computadora.",
    icon: FileText,
  },
  {
    title: "Búsqueda inteligente",
    description:
      "Encuentra documentos por contenido, fecha o tipo de archivo en segundos.",
    icon: Search,
  },
  {
    title: "Gestión de permisos",
    description:
      "Controla quién ve qué documento con roles y niveles de acceso.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background page-enter">
      {/* Hero section */}
      <HeroAnimation>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
          <div className="text-center max-w-3xl mx-auto">
            <ScrollReveal variant="fade" delay={0.1} once>
              <span className="inline-block bg-primary/10 text-primary text-[0.75rem] font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider animate-pulse">
                MiPymes
              </span>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delay={0.2} once>
              <h1 className="font-display clamp(2.5rem, 6vw, 4rem) font-bold text-text-primary mb-6 leading-tight">
                Tu archivo de oficina,{" "}
                <span className="text-primary">sin papeles sueltos</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade" delay={0.3} once>
              <p className="text-text-secondary text-lg sm:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
                Sube, busca y organiza facturas, contratos y permisos en un solo lugar.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delay={0.4} once>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ProtectedButton
                  href="/subir?pick=1"
                  variant="primary"
                  className="px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Subir primer documento <ArrowRight className="ml-2 w-5 h-5" />
                </ProtectedButton>
                <Link
                  href="/guide"
                  className="px-8 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 border border-primary text-primary hover:bg-primary/10"
                >
                  Ver cómo funciona <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Decorative element */}
          <div className="absolute right-0 top-1/6 -translate-y-1/4 hidden sm:block lg:block">
            <div className="bg-primary/5 border border-primary/20 rounded-full blur-[80px] h-64 w-64 animate-pulse" />
          </div>
        </section>
      </HeroAnimation>

      {/* Stats section */}
      <ScrollReveal variant="slide-up" delay={0.5} once className="my-16">
        <section className="bg-surface border border-border rounded-2xl py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Documentos indexados", value: "0", icon: FileText },
                { label: "Búsquedas por mes", value: "0", icon: Search },
                { label: "Horas ahorradas", value: "0", icon: ShieldCheck },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  variant="elevated"
                  className="p-6 text-center group cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-text-secondary text-sm mb-2 uppercase tracking-wider">
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
      </ScrollReveal>

      {/* Features section */}
      <ScrollReveal variant="fade" delay={0.6} once>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Todo lo que tu archivo necesita
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg">
              Herramientas diseñadas para MiPymes que gestionan documentos sin
              departamento de sistemas.
            </p>
          </div>

          <HeroStagger>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  variant="hoverable"
                  className="p-6 h-full group cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg"
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-surface transition-colors duration-300"
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </HeroStagger>
        </section>
      </ScrollReveal>

      {/* Repeating CTA */}
      <RepeatingCTA variant="primary" />
    </main>
  );
}
