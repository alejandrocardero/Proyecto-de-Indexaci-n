"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  FileText,
  Search,
  ShieldCheck,
  Brain,
  Upload,
  Mail,
  ArrowRight,
  CheckCircle2,
  Zap,
  FileCheck,
  Monitor,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Regístrate o inicia sesión",
    description:
      "Crea tu cuenta gratuita para poder subir y organizar tus documentos de forma segura.",
    icon: Mail,
    badge: "Gratis",
  },
  {
    number: 2,
    title: "Elige tu modelo de IA",
    description:
      "Selecciona entre Gemini 2.5 Pro, Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B o Mistral Local para procesar tus archivos.",
    icon: Brain,
    badge: "Multimodal",
  },
  {
    number: 3,
    title: "Sube cualquier archivo",
    description:
      "Arrastra y suelta PDF, imágenes, Word, Excel, TXT, CSV, JSON y más. No hay restricciones de formato.",
    icon: Upload,
    badge: "Cualquier tipo",
  },
  {
    number: 4,
    title: "Indexación automática",
    description:
      "La app extrae el texto con OCR y visión por computadora, genera embeddings y lo hace buscable en segundos.",
    icon: Zap,
    badge: "IA",
  },
  {
    number: 5,
    title: "Haz preguntas sobre el contenido",
    description:
      "Chatea con tus documentos usando IA. Pregunta por fechas, cláusulas, montos o cualquier detalle del archivo.",
    icon: FileCheck,
    badge: "RAG",
  },
  {
    number: 6,
    title: "Organiza y encuentra todo",
    description:
      "Busca por nombre, contenido, fecha o tipo de documento. Controla quién ve qué con permisos y roles.",
    icon: Monitor,
    badge: "Seguro",
  },
];

export default function GuidePage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <main className="min-h-screen bg-background page-enter">
      {/* Header */}
      <ScrollReveal variant="fade" once className="pt-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 inline-block">
            <CheckCircle2 className="w-4 h-4" />
            Guía paso a paso
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary mb-6">
            Cómo funciona MiPymes Indexación
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Organiza tus facturas, contratos y permisos con IA en seis pasos
            sencillos, sin necesidad de departamento de sistemas.
          </p>
        </section>
      </ScrollReveal>

      {/* Steps timeline */}
      <ScrollReveal variant="slide-up" once className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <section className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute left-[50px] top-16 bottom-16 w-0.5 bg-border mx-auto" />

          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`
                relative mb-16 lg:mb-24 px-4 sm:px-6 lg:px-8
                lg:${index % 2 === 0 ? "pr-1/2 text-right" : "pl-1/2 text-left"}
              `}
            >
              {/* Step circle */}
              <div
                className={`relative z-10 inline-block w-12 h-12 rounded-full border-4 flex items-center justify-center mx-auto lg:mx-0 transition-colors duration-300 ${
                  index <= currentStep
                    ? "bg-primary border-primary text-surface"
                    : "bg-surface border-border text-text-muted"
                }`}
                onClick={() => setCurrentStep(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setCurrentStep(index)}
              >
                <span className="text-sm font-bold">
                  {index <= currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                </span>
              </div>

              {/* Content card */}
              <Card
                variant="elevated"
                className={`mt-8 lg:mt-0 ${index % 2 === 0 ? "lg:ml-auto lg:mr-0 lg:w-[320px]" : "lg:mr-auto lg:ml-0 lg:w-[320px]"}`}
              >
                <div className="flex items-start gap-3 p-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    index <= currentStep ? "bg-primary text-surface" : "bg-secondary text-text-inverse"
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {step.badge}
                    </Badge>
                    <h3 className="font-semibold text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                <CardFooter>
                  <Link
                    href="/upload?pick=1"
                    className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    Probar ahora <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ))}
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal variant="fade" once>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              ¿Listo para indexar tus documentos?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
              Comienza gratis en menos de un minuto. Sube tu primer archivo y
              empieza a hacerle preguntas con IA.
            </p>
            <Button
              asChild
              variant="primary"
              className="px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Link href="/auth/register">
                Crear cuenta gratuita <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
