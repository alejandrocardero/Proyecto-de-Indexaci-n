"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "staff" | "viewer";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  currentLang: string;
  setLang: (lang: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let currentUser: User | null = null;

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mipymes_lang");
      return stored || "es";
    }
    return "es";
  });

  // Simular sesión persistente desde localStorage (solo en cliente)
  useEffect(() => {
    const stored = localStorage.getItem("mipymes_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        currentUser = parsed;
      } catch {
        // ignorar
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("mipymes_lang", currentLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = currentLang;
    }
  }, [currentLang]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email,
      name: email.split("@")[0],
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    currentUser = newUser;
    localStorage.setItem("mipymes_user", JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: data.email,
      name: data.name,
      role: "viewer",
      createdAt: new Date().toISOString(),
    };
    currentUser = newUser;
    localStorage.setItem("mipymes_user", JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    currentUser = null;
    localStorage.removeItem("mipymes_user");
    setUser(null);
  }, []);

  const setLang = useCallback((lang: string) => {
    setCurrentLang(lang);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, currentLang, setLang }}>
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
