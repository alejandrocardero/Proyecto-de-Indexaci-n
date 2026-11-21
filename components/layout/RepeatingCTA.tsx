"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-local";

export function RepeatingCTA({ variant = "primary" }: { variant?: "primary" | "outline" | "ghost" } = {}) {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 bg-primary/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="text-xs font-semibold text-success uppercase tracking-wider">
            Listo para empezar
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          Organiza tus documentos en minutos
        </h2>
        {(!isAuthenticated && (
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
            Crea tu cuenta gratuita y sube tu primer documento hoy mismo.
          </p>
        ))}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated && (
            <Link
              href="/auth/register"
              className={`px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 ${
                variant === "primary"
                  ? "bg-primary text-surface hover:bg-primary-hover shadow-lg hover:shadow-xl"
                  : variant === "outline"
                  ? "border border-primary text-primary hover:bg-primary/10"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              Comenzar gratis <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/subir"
              className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 bg-primary text-surface hover:bg-primary-hover shadow-lg hover:shadow-xl"
            >
              Subir documento <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
          {!isAuthenticated && variant !== "primary" && (
            <Link
              href="/subir"
              className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 bg-surface border border-border text-text-primary hover:bg-primary/5 hover:text-primary"
            >
              Ver demo
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
