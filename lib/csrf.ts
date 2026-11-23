"use client";

/**
 * Token CSRF compartido por todos los clientes que usan el túnel same-origin.
 * El backend emite la cookie legible `mipymes_csrf` y exige devolver el valor
 * en la cabecera `X-CSRF-Token` en toda petición que autentique con cookies.
 */

const AUTH_API = "/api/backend/auth";
let csrfToken: string | null = null;

export async function ensureCsrf(): Promise<void> {
  if (csrfToken) return;
  try {
    const res = await fetch(`${AUTH_API}/csrf`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data?.token ?? null;
    }
  } catch {
    // El backend rechazará la mutación con CSRF_INVALID si no hay token.
  }
}

export async function csrfHeaders(): Promise<Record<string, string>> {
  await ensureCsrf();
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
}

export function clearCsrf(): void {
  csrfToken = null;
}
