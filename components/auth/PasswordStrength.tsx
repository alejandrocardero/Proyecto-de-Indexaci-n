"use client";

import { useState } from "react";
import { validatePassword } from "@/lib/auth-local";

export interface PasswordStrengthProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

const bars = 4;

export function PasswordStrength({
  value,
  onChange,
  label = "Contraseña",
  required = true,
  className,
}: PasswordStrengthProps) {
  const { score, feedback, isValid } = validatePassword(value);
  const [showPassword, setShowPassword] = useState(false);

  const barClass = (index: number) => {
    if (index >= score) return "bg-border";
    if (score <= 1) return "bg-destructive";
    if (score <= 2) return "bg-warning";
    if (score === 3) return "bg-primary";
    return "bg-success";
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? "🙈" : "👁"}
        </button>
      </div>

      {/* Barra de fortaleza */}
      <div className="mt-1.5 flex h-1.5 gap-0.5">
        {[...Array(bars)].map((_, i) => (
          <div
            key={i}
            className={`h-full rounded-sm transition-all duration-300 ${barClass(i)}`}
          />
        ))}
      </div>

      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1 text-[0.65rem]">
          {score === 0 && (
            <span className="text-text-muted">Ingresa una contraseña</span>
          )}
          {score > 0 && score < bars && (
            <span className="text-text-secondary">
              Falta: {feedback.join(", ")}
            </span>
          )}
          {isValid && (
            <span className="text-success font-medium">✓ Contraseña segura</span>
          )}
        </div>
      )}

      {required && !isValid && value.length > 0 && (
        <p className="mt-1 text-[0.65rem] text-destructive">
          La contraseña no cumple los requisitos de seguridad
        </p>
      )}
    </div>
  );
}
