"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-local";
import { useRouter } from "next/navigation";

export interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña");
      return;
    }
    try {
      await login(email, password);
      onSuccess?.();
      router.push("/");
      router.refresh();
    } catch {
      setError("Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div className={className}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(value) => setEmail(value)}
          label="Correo electrónico"
          disabled={isLoading}
        />

        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(value) => setPassword(value)}
          label="Contraseña"
          disabled={isLoading}
        />

        {error && (
          <div className="bg-destructive-light border border-destructive/20 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
        >
          Iniciar sesión
        </Button>
      </form>
    </div>
  );
}
