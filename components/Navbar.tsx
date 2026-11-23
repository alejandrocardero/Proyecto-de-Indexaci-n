"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-local";
import { Button } from "@/components/ui/button";
// import { LanguageSelector } from "@/components/layout/LanguageSelector"; // Temporalmente desactivado
import { ProtectedButton } from "@/components/auth/ProtectedButton";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display font-bold text-text-primary">MiPymes</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 rounded-lg bg-primary text-surface text-sm font-medium hover:bg-primary-hover transition-all"
                  >
                    Crear cuenta
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary">{user?.name}</span>
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                  </div>
                  <ProtectedButton
                    href="/documentos"
                    variant="ghost"
                    size="sm"
                    className="text-sm text-text-secondary hover:text-primary hover:bg-primary/5"
                  >
                    Documentos
                  </ProtectedButton>
                  <ProtectedButton
                    href="/subir"
                    variant="ghost"
                    size="sm"
                    className="text-sm text-text-secondary hover:text-primary hover:bg-primary/5"
                  >
                    Subir
                  </ProtectedButton>
                  <ProtectedButton
                    href="/buscar"
                    variant="ghost"
                    size="sm"
                    className="text-sm text-text-secondary hover:text-primary hover:bg-primary/5"
                  >
                    Buscar
                  </ProtectedButton>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Cerrar sesión
                  </Button>
                </>
              )}

              {/* Selector de idioma desactivado temporalmente
              <div className="hidden md:flex">
                <LanguageSelector currentLang={currentLang} onLangChange={setLang} />
              </div>
              */}

              {/* Desktop settings button */}
              <div className="hidden md:flex">
                <Link href="/configuraciones">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Settings className="w-3 h-3 mr-1.5" />
                    Configurar IA
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-text-primary hover:bg-primary/5 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full md:w-80 bg-surface border-l border-border shadow-2xl md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="font-display font-bold text-text-primary">MiPymes</span>
                  </div>
                  <button onClick={toggleMobileMenu} className="p-2 text-text-primary hover:bg-primary/5 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <nav className="flex-1 px-6 space-y-3">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={closeMobileMenu}
                      className="block w-full text-center px-4 py-3 text-surface rounded-xl bg-primary hover:bg-primary-hover transition-all"
                    >
                      Crear cuenta
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-border mb-4">
                      <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                      <p className="text-xs text-text-secondary">{user?.role}</p>
                    </div>
                    <ProtectedButton
                      href="/documentos"
                      onClick={closeMobileMenu}
                      variant="ghost"
                      size="sm"
                      className="block w-full text-left px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors justify-start"
                    >
                      Documentos
                    </ProtectedButton>
                    <ProtectedButton
                      href="/subir"
                      onClick={closeMobileMenu}
                      variant="ghost"
                      size="sm"
                      className="block w-full text-left px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors justify-start"
                    >
                      Subir documento
                    </ProtectedButton>
                    <ProtectedButton
                      href="/buscar"
                      onClick={closeMobileMenu}
                      variant="ghost"
                      size="sm"
                      className="block w-full text-left px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors justify-start"
                    >
                      Búsqueda
                    </ProtectedButton>
                    <button
                      onClick={() => { logout(); closeMobileMenu(); }}
                      className="block w-full text-left px-4 py-3 text-text-primary rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </nav>

              <div className="p-6 border-t border-border">
                {/* Selector de idioma desactivado temporalmente
                <LanguageSelector currentLang={currentLang} onLangChange={setLang} className="w-full" />
                */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Tema:</span>
                  <button
                    onClick={() => {
                      const html = document.documentElement;
                      if (html.classList.contains("dark")) {
                        html.classList.remove("dark");
                      } else {
                        html.classList.add("dark");
                      }
                    }}
                    className="p-2 text-text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    {document.documentElement.classList.contains("dark") ? (
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
