"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validate = (email: string, password: string): string | null => {
    if (!email || !password) return "Ingresa tu correo y contraseña"
    if (!email.includes("@")) return "Correo inválido"
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const validationError = validate(email, password)
    if (validationError) { setError(validationError); return }

    setIsLoading(true)
    try {
      // 🔌 PUNTO DE INTEGRACIÓN: reemplazar por llamada real a tu auth
      // const res = await signIn("credentials", { email, password, redirect: false })
      // if (res?.error) throw new Error(res.error)

      await new Promise(r => setTimeout(r, 800))

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative page-enter">
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-md mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-surface border border-border shadow-xl rounded-2xl p-8 sm:p-10 animate-in slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
              Iniciar sesión
            </h1>
            <p className="text-text-secondary text-sm">
              Accede a tu archivo de documentos
            </p>
          </div>

          {error && (
            <div id="login-error" role="alert" className="mb-6 bg-destructive-light border border-destructive/20 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(value: string) => setEmail(value)}
              label="Correo electrónico"
              disabled={isLoading}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />

            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(value: string) => setPassword(value)}
              label="Contraseña"
              disabled={isLoading}
              showPassword
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
            </Button>

            <p className="mt-6 text-sm text-text-secondary text-center">
              <a
                href="#"
                className={cn("underline underline-offset-4 hover:text-primary-hover")}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-4">
              ¿Nueva cuenta?
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Crear cuenta gratis
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}