"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { csrfHeaders, clearCsrf, ensureCsrf } from "@/lib/csrf";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "staff" | "viewer";
  country: string;
  companyName: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    country?: string;
    companyName?: string;
  }) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ token: string | null; expiresIn: number }>;
  resetPassword: (token: string, password: string) => Promise<void>;
  currentLang: string;
  setLang: (lang: string) => void;
}

// Tunnel same-origin definido en next.config.ts. La cookie de sesión es HttpOnly:
// el navegador la envía automáticamente y el JS nunca ve el token.
const AUTH_API = "/api/backend/auth";
const USER_KEY = "mipymes_user";
const TOKEN_KEY = "mipymes_auth_token"; // legado: se elimina al hidratar
const LANG_KEY = "mipymes_lang";

/** Proveedores de correo aceptados (debe coincidir con el backend). */
export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.es", "yahoo.co.uk", "yahoo.com.mx", "yahoo.com.ar", "yahoo.com.br", "yahoo.fr", "yahoo.de", "yahoo.ca",
  "hotmail.com", "hotmail.es", "hotmail.co.uk",
  "outlook.com", "outlook.es", "live.com", "live.com.mx", "msn.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "proton.me", "protonmail.com", "protonmail.ch",
  "mail.com", "gmx.com", "gmx.es", "zoho.com", "yandex.com", "yandex.ru",
] as const;

export function isAllowedEmailDomain(email: string): boolean {
  const value = email.trim().toLowerCase();
  const domain = value.split("@")[1];
  return !!domain && (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(domain);
}

/** Error de la API de autenticación con código y mensaje del backend. */
export class AuthApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, code?: string, status = 400) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
  }
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(method);
  const csrf = needsCsrf ? await csrfHeaders() : {};

  let res: Response;
  try {
    res = await fetch(`${AUTH_API}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrf,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new AuthApiError(
      "No se pudo conectar con el servidor de autenticación. Verifica que el backend esté activo.",
      "NETWORK_ERROR",
      0
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail?.message || data?.message || "Error en la autenticación";
    const code = typeof detail === "object" ? detail?.code : undefined;
    throw new AuthApiError(message, code, res.status);
  }
  return data as T;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Valida la fortaleza de la contraseña.
 * Devuelve un objeto con puntuación (0-4), retroalimentación y si es válida.
 */
export function validatePassword(password: string) {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push("Al menos 8 caracteres");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Incluye al menos una letra minúscula");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Incluye al menos una letra mayúscula");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Incluye al menos un número");

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push("Incluye al menos un carácter especial (!@#$%^&*)");

  const isValid = score >= 4;

  return { score, feedback, isValid };
}

function persistUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(TOKEN_KEY); // el token vive solo en la cookie HttpOnly
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LANG_KEY) || "es";
    }
    return "es";
  });

  // Hidratar la sesión validando la cookie contra la base de datos local.
  useEffect(() => {
    let mounted = true;
    localStorage.removeItem(TOKEN_KEY);

    authFetch<User>("/session")
      .then((validUser) => {
        if (!mounted) return;
        persistUser(validUser);
        setUser(validUser);
      })
      .catch(() => {
        if (!mounted) return;
        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, currentLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = currentLang;
    }
  }, [currentLang]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authFetch<{ token: string; user: User }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      persistUser(data.user);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      country?: string;
      companyName?: string;
    }) => {
      setIsLoading(true);
      try {
        const result = await authFetch<{ token: string; user: User }>("/register", {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            country: data.country ?? "CO",
            companyName: data.companyName ?? "MiPyme",
          }),
        });
        persistUser(result.user);
        setUser(result.user);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    authFetch("/logout", { method: "POST" }).catch(() => undefined);
    clearCsrf();
    clearSession();
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return authFetch<{ token: string | null; expiresIn: number }>("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await authFetch("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }, []);

  const setLang = useCallback((lang: string) => {
    setCurrentLang(lang);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        currentLang,
        setLang,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
