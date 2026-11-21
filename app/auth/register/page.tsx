"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [mode, setMode] = useState<"register" | "login">("register");

  return (
    <main className="min-h-screen bg-background relative page-enter">
      {/* Decorative background */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-md mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-surface border border-border shadow-xl rounded-2xl p-8 sm:p-10 animate-in slide-up"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
              {mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
            </h1>
            <p className="text-text-secondary text-sm">
              {mode === "register"
                ? "Únete a MiPymes y organiza tus documentos"
                : "Accede a tu archivo de documentos"}
            </p>
          </div>

          {mode === "register" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <RegisterForm onSuccess={() => {}} />
            </motion.div>
          ) : null}

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-text-secondary">
              {mode === "register" ? "¿Ya tienes cuenta?" : "¿No tienes cuenta aún?"}
            </p>
            <Link
              href={mode === "register" ? "/auth/login" : "/auth/register"}
              onClick={() => setMode(mode === "register" ? "login" : "register")}
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-surface text-sm font-medium hover:bg-primary-hover transition-all"
            >
              {mode === "register" ? "Inicia sesión aquí" : "Regístrate aquí"}
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/privacy"
              className={cn("text-xs text-text-secondary underline underline-offset-4 hover:text-primary-hover transition-colors")}
            >
              Política de privacidad
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
