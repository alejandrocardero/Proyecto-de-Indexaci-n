"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { isAllowedEmailDomain, useAuth, validatePassword } from "@/lib/auth-local";
import { useRouter } from "next/navigation";

export interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const { isValid } = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Completa todos los campos");
      return;
    }

    if (!isAllowedEmailDomain(email)) {
      setError("Usa un correo de un proveedor permitido: gmail, yahoo, hotmail, outlook, icloud, etc.");
      return;
    }

    if (!validatePassword(password).isValid) {
      setError("La contraseña no es lo suficientemente segura");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y la política de privacidad");
      return;
    }

    try {
      await register({ name, email, password });
      onSuccess?.();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta. Intenta de nuevo.");
    }
  };

  return (
    <div className={className}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Juan Pérez"
          value={name}
          onChange={(value) => setName(value)}
          label="Nombre completo"
          disabled={isLoading}
        />

        <Input
          type="email"
          placeholder="tuusuario@gmail.com"
          value={email}
          onChange={(value) => setEmail(value)}
          label="Correo electrónico"
          disabled={isLoading}
        />

        <PasswordStrength
          value={password}
          onChange={(v) => setPassword(v)}
          label="Contraseña"
        />

        <Input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(value) => setConfirmPassword(value)}
          label="Confirmar contraseña"
          disabled={isLoading}
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-border bg-surface text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
          <label className="text-sm text-text-secondary leading-relaxed">
            Acepto los <a href="/privacy" className="underline hover:text-primary">Términos y Condiciones</a> y la{" "}
            <a href="/privacy" className="underline hover:text-primary">Política de Privacidad</a>
          </label>
        </div>

        {error && (
          <div className="bg-destructive-light border border-destructive/20 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !isValid || !acceptTerms}
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
        >
          Crear cuenta
        </Button>
      </form>
    </div>
  );
}
