"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";

interface MobileMenuProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
  onLogin: () => void;
  onRegister: () => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
}

export function MobileMenu({
  isAuthenticated,
  userName,
  onLogout,
  onLogin,
  onRegister,
  currentLang,
  onLangChange,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 text-text-primary hover:bg-primary/5 rounded-lg"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="font-display font-bold text-text-primary">MiPymes</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-text-primary hover:bg-primary/5 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-6 space-y-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={toggleMenu}
                      className="block px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={toggleMenu}
                      className="block px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Crear cuenta
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{userName}</p>
                      <p className="text-xs text-text-secondary">{isAuthenticated ? "Autenticado" : ""}</p>
                    </div>
                    <Link
                      href="/documentos"
                      onClick={toggleMenu}
                      className="block px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Documentos
                    </Link>
                    <Link
                      href="/subir"
                      onClick={toggleMenu}
                      className="block px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Subir documento
                    </Link>
                    <Link
                      href="/buscar"
                      onClick={toggleMenu}
                      className="block px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Búsqueda
                    </Link>
                    <button
                      onClick={() => { onLogout(); toggleMenu(); }}
                      className="block w-full text-left px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </nav>

              <div className="p-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">Idioma:</span>
                  <select
                    value={currentLang}
                    onChange={(e) => onLangChange(e.target.value)}
                    className="text-sm text-text-primary bg-transparent border-none focus:ring-0"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-text-secondary">Tema:</span>
                  <button onClick={toggleMenu} className="p-2 text-text-primary hover:bg-primary/5 rounded-lg">
                    {typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
