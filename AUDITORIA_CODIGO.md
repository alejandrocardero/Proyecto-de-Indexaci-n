# Auditoría de Código — Proyecto de Indexación (`D:\Marcos\git\Proyecto-de-Indexaci-n`)

**Fecha:** 2026-11-25  
**Versión del proyecto:** `0.1.0` (Next.js 15.0.0, React 18.2, TypeScript 5.9, Tailwind 3.4)  
**Alcance:** Auditoría estática de solo lectura — lógica/flujos frontend, UI/accesibilidad, configuración/dependencias. No se modificó ningún archivo.

---

## 1. Resumen ejecutivo

| Categoría | Críticos | Altos | Medios | Bajos |
|-----------|----------|-------|--------|-------|
| **Lógica y flujos (frontend)** | 1 | 3 | 3 | 3 |
| **UI / Accesibilidad** | 8 | 6 | 8 | 6 |
| **Configuración / Seguridad** | 1 | 2 | 0 | 0 |
| **Total** | **10** | **11** | **11** | **9** |

El proyecto compila (`npm run build` ✅) y TypeScript pasa (`tsc --noEmit` ✅), pero **la UI no es funcional** para uso real: flujos de autenticación, administración, búsqueda y carga de archivos están incompletos (hardcoded/sin lógica), y componentes UI tienen defectos de accesibilidad que impiden su uso con teclado/lectores de pantalla. Además, la cadena de dependencias tiene **una vulnerabilidad crítica (RCE en `next/image`)** y dos altas que requieren actualización inmediata de `next` a `≥ 15.5.29`.

> **Nota:** Este proyecto es una **plantilla frontend sin backend operativo**. Los hallazgos de "lógica" reflejan código frontend incompleto (handlers vacíos, datos hardcoded, validaciones ausentes), no integración con API.

---

## 2. Hallazgos por severidad

### 🔴 CRÍTICO (10)

| ID | Área | Archivo:línea | Hallazgo | Impacto | Recomendación |
|----|------|---------------|----------|---------|---------------|
| **C-L1** | Lógica | `app/auth/login/page.tsx:20` | Login es un no-op: `// TODO: llamar al endpoint de autenticación` | Formulario de login no hace nada al enviar | Implementar handler frontend completo (validación, estado loading, feedback, redirect) |
| **C-L2** | Lógica | `app/admin/page.tsx:36-41` | `handleApprove` / `handleReject` solo `console.log` | Botones de admin no producen cambio visible | Implementar lógica frontend: estado optimista, confirmación, feedback visual |
| **C-L3** | Lógica | `app/search/results/page.tsx:19-31` | `handleSearch` ignora `filters` y devuelve datos hardcodeados | Filtros no funcionan; búsqueda engañosa | Filtrar array local por `filters.status` y `filters.dateRange` antes de setear estado |
| **C-L4** | Lógica | `app/upload/page.tsx:62, 117, 236` | Sin validación de tipo/tamaño de archivo (solo texto UI) | Posible subida de ejecutables o >50 MB sin feedback | Validar `file.type` y `file.size` en cliente antes de procesar |
| **C-A1** | Accesibilidad | `components/ui/dialog.tsx:62-89` | Diálogo sin focus trap, sin restauración de foco, sin `aria-hidden` en fondo | Teclado/lectores de pantalla escapan del modal | Usar `<dialog>` nativo con `showModal()` o focus trap + `inert` |
| **C-A2** | Accesibilidad | `components/ui/dropdown.tsx:72-99` | Menú sin `role="listbox"`, `aria-pressed` incorrecto, sin navegación por teclado | Dropdown inoperable por teclado/lector | Implementar patrón ARIA Listbox con navegación ArrowUp/Down/Home/End/Escape |
| **C-A3** | Accesibilidad | `components/ui/button.tsx:78-91` | `asChild` renderiza `<span>` con `disabled`, `aria-disabled`, `type` — inválido en span | Botón "asChild" no enfocable ni activable | Usar Radix Slot; nunca renderizar `<span>` como botón |
| **C-A4** | Accesibilidad | `components/ui/pagination.tsx:84-92` | Página activa con `disabled={true}` → sale del orden de tabulación | Teclado no llega a la página actual | Quitar `disabled` en página activa; usar `aria-current="page"` |
| **C-A5** | Accesibilidad | `app/upload/page.tsx:238-243` | `<input type="file" className="hidden">` → `display:none` lo saca del árbol de accesibilidad | Lectores de pantalla pueden no anunciar control de archivo | Usar `sr-only` (clip-path) + `<label>` como dropzone |
| **C-S1** | Seguridad | `package.json:13` + `package-lock.json:1232` | `next@15.0.0` — **RCE no autenticado en Image Optimization API** (SVG/AVIF) | Ejecución remota de código en servidor | Actualizar `next` a `≥ 15.5.29` |

---

### 🟠 ALTO (11)

| ID | Área | Archivo:línea | Hallazgo | Impacto | Recomendación |
|----|------|---------------|----------|---------|---------------|
| **H-L1** | Lógica | `app/admin/page.tsx:248-250` | `Pagination` con `totalPages={3}` hardcodeado y `onPageChange` solo actualiza estado | Paginación visual sin datos reales | Calcular `totalPages` desde array filtrado; `onPageChange` actualiza página y re-render |
| **H-L2** | Lógica | `app/admin/page.tsx:145-152, 199` | `searchQuery` capturado pero nunca filtra `pendingDocs` | Búsqueda en admin no funciona | Filtrar `pendingDocs` por `searchQuery` antes de renderizar tabla |
| **H-L3** | Lógica | `app/documents/page.tsx:15`, `app/search/results/page.tsx:23`, `app/admin/page.tsx:20` | Datos de documentos duplicados en 3 páginas con estructuras ligeramente distintas | Inconsistencia y mantenimiento 3× | Centralizar en un hook/shared module (`lib/data/documents.ts`) consumido por las 3 páginas |
| **H-A1** | Accesibilidad | `components/ui/input.tsx:95-99` | Texto de ayuda (`helper`) con `id="input-helper"` pero **no referenciado en `aria-describedby`** | Ayuda no anunciada a lectores de pantalla | `aria-describedby` dinámico que incluya `input-helper` y `input-error` |
| **H-A2** | Accesibilidad | `components/ui/table.tsx:63, 108` | `<th>` sin `scope="col"` | Lectores no asocian encabezados con celdas | Añadir `scope="col"` a todos los `<th>` |
| **H-A3** | Accesibilidad | `components/ui/table.tsx:58` | Tablas sin `<caption>` ni `aria-label` | Usuario no sabe de qué trata la tabla | Añadir `<caption>` (puede ser `sr-only`) o `aria-label` en cada tabla |
| **H-A4** | Accesibilidad | `components/ui/nav.tsx:81-120` | Botón hamburguesa sin `aria-expanded`/`aria-controls`; menú móvil sin gestión de foco | Menú móvil inaccesible | Añadir `aria-expanded`, `aria-controls`, focus trap en panel, Escape cierra y restaura foco |
| **H-A5** | Accesibilidad | `components/ui/breadcrumb.tsx:31-59` | Sin `aria-current="page"` en ítem actual; separadores `/` sin `aria-hidden="true"` | Lectores anuncian separadores y no marcan página actual | `aria-current="page"` en último ítem; separadores con `aria-hidden="true"` o CSS `::before` |
| **H-A6** | Accesibilidad | `components/ui/empty-state.tsx:42-45` | Acción string → `<button>` con estilos en línea, sin anillo de foco consistente | Foco invisible en botón de estado vacío | Usar componente `Button` compartido o clases `focus-visible:ring-2` |
| **H-S1** | Seguridad | `package-lock.json:1373, 1653` | `postcss@8.5.32` (vía `next`) — lectura arbitraria de archivos via `sourceMappingURL` | Exposición de archivos fuera del proyecto | Actualizar `next` (trae `postcss` parcheado) |
| **H-S2** | Seguridad | `package-lock.json:1653` | `sharp@0.33.5` (vía `next`) — vulnerabilidades en `libvips`, `libheif`, `librsvg` | RCE/DoS procesando imágenes maliciosas | Actualizar `next` (trae `sharp ≥ 0.35.5`) |

---

### 🟡 MEDIO (11)

| ID | Área | Archivo:línea | Hallazgo | Impacto | Recomendación |
|----|------|---------------|----------|---------|---------------|
| **M-L1** | Lógica | `app/page.tsx:57-61` | Stats hardcodeadas a `0` — no reflejan estado real | Métricas engañosas | Usar placeholders animados (skeleton) o quitar si no hay datos |
| **M-A1** | Accesibilidad | `components/ui/badge.tsx:27` | Variante `primary` usa `text-primary-hover` (color de hover como texto base) | Inconsistencia semántica visual | Usar token de texto base (`text-primary` o `text-primary-hover` según intención) |
| **M-A2** | Accesibilidad | `components/ui/table.tsx:148` | `onMouseOver={undefined} onMouseOut={undefined}` — código muerto | Ruido, sin efecto | Eliminar atributos |
| **M-A3** | Accesibilidad | `components/ui/dialog.tsx:96-125` | `DialogOverlay` y `DialogContent` exportados pero no usados | Código muerto | Eliminar o documentar uso previsto |
| **M-A4** | Accesibilidad | `styles/variables.css:126-152` + `styles/animations.css:1-78` | `@keyframes fade-in` y `.animate-in` duplicados en ambos archivos | Conflicto de cascada CSS | Unificar en un solo archivo (`styles/animations.css`) |
| **M-A5** | Accesibilidad | `components/ui/skeleton.tsx:36-44` | Sin `aria-busy="true"` ni `role="status"` | Lectores no saben que es carga | Añadir `aria-busy="true"` y `role="status"` |
| **M-A6** | Accesibilidad | `components/ui/card.tsx:60-67` | `icon` + children envueltos en `CardHeader` sin heading impuesto | Posible falta de jerarquía | Documentar que `CardTitle` debe usarse con heading apropiado |
| **M-A7** | Accesibilidad | `components/ui/breadcrumb.tsx:44, 54` | `key={item.label}` → claves duplicadas si etiquetas repetidas | Errores de renderizado React | Usar `item.href` o índice como fallback |
| **M-A8** | Accesibilidad | `components/ui/nav.tsx:68, 107` | `key={index}` en listas de enlaces — antipatrón React | Inestabilidad en listas | Usar `link.href` como key |
| **M-S1** | Config | `package.json:6-9` | Scripts solo `dev/build/start/lint` — sin `test`, `ci`, `typecheck` | CI/CD incompleto | Añadir scripts: `typecheck`, `test`, `ci` |
| **M-S2** | Config | — | Sin tests unitarios/integración (`*.test.tsx` inexistentes) | Sin red de regresión | Introducir Vitest + React Testing Library |

---

### 🟢 BAJO (9)

| ID | Área | Archivo:línea | Hallazgo | Recomendación |
|----|------|---------------|----------|---------------|
| **B-A1** | Accesibilidad | `components/ui/button.tsx:86, 100` | Atributo `title` en botones deshabilitados/carga — no accesible | Eliminar `title`; usar `aria-label` o texto visible |
| **B-A2** | Accesibilidad | `components/ui/input.tsx:75-88` | Botón mostrar/ocultar contraseña sin `aria-controls` | Añadir `aria-controls={inputId}` |
| **B-A3** | Accesibilidad | `components/ui/table.tsx:15, 22` | Prop `striped` aceptada pero nunca usada | Implementar rayas via CSS o eliminar prop |
| **B-A4** | Accesibilidad | `components/ui/empty-state.tsx:22` | `animate-in` incondicional — puede violar `prefers-reduced-motion` | Verificar que CSS respeta media query (ya lo hace) |
| **B-A5** | Accesibilidad | `app/upload/page.tsx:174-176` | `handleSendClick` construye evento falso con `as React.FormEvent` | Refactorizar llamando a handler directamente |
| **B-A6** | Accesibilidad | `app/admin/page.tsx:36-42` | Botones Aprobar/Rechazar visibles pero sin efecto real | Deshabilitar/ocultar hasta implementar lógica frontend |
| **B-C1** | Config | `.gitignore:44-49` | Archivos de reporte interno en `.gitignore` — ruido | Mover a carpeta `docs/` o `.github/` |
| **B-C2** | Config | `tailwind.config.ts:8` | `content` incluye `./styles/variables.css` — innecesario | Quitar de `content` |
| **B-C3** | Config | `postcss.config.js` | Sin `cssnano` o minificación en producción | Añadir `cssnano` para build de producción |

---

## 3. Riesgos condicionados (dependen de decisiones futuras)

| ID | Riesgo | Condición | Mitigación |
|----|--------|-----------|------------|
| **R1** | Auth sin rate limiting → fuerza bruta | Si se implementa login sin controles cliente/servidor | Mostrar feedback de intentos fallidos; documentar necesidad de rate limit en backend |
| **R2** | Subida sin validación MIME real | Si usuario sube `.exe` renombrado a `.pdf` | Documentar: validación cliente es UX; backend DEBE verificar magic bytes |
| **R3** | Filtros simulados crean falsa expectativa | Si se conecta backend sin pasar filtros como parámetros | Diseñar interfaz de filtros que coincida con parámetros de API esperados |
| **R4** | Approve/Reject sin CSRF | Si endpoints reales sin tokens CSRF | Documentar: `SameSite=Strict` cookies + header CSRF en backend |
| **R5** | Contraste insuficiente | `--color-primary #b45309` sobre `#ffffff` = **5.02:1** (AA grande ✅, AA normal ❌ 4.5:1) | Usar `--color-primary-hover #92400e` (6.1:1) para texto normal |
| **R6** | Color semántico duplicado | `--color-warning` = `--color-primary` (`#b45309`) | Distinguir tokens: warning `#ca8a04` (amber-600) |
| **R7** | Dark mode solo por `prefers-color-scheme` | `darkMode: "class"` pero sin toggle de clase `dark` en UI | Añadir botón toggle que añada/quite clase `dark` en `<html>` |
| **R8** | Tokens CSS no definidos en runtime | `bg-primary/3`, `bg-primary/5`, `text-text-inverse`, `border-border-strong`, `bg-secondary-hover`, `bg-destructive-hover`, `duration-160`, `ring-3`, `border-1`, `shadow-xs`, `top-1/6`, `underline-none`, `clamp()` — **no generados por Tailwind** | Añadir a `tailwind.config.ts` o reemplazar por tokens existentes/arbitrary values |
| **R9** | Fonts Geist/Playfair no cargadas | `--font-geist-sans`, `--font-geist-mono`, `--font-playfair-display` referenciadas pero sin `@font-face` ni `next/font` | Usar `next/font/google` o definir `@font-face` en `globals.css` |
| **R10** | Lint no ejecutable en CI | `npm run lint` lanza asistente interactivo de ESLint | Añadir `eslint.config.mjs` con config Next recomendada |

---

## 4. Evidencia de validación automatizada

| Comando | Resultado | Nota |
|---------|-----------|------|
| `npm run build` | ✅ Compilación exitosa (9 páginas estáticas) | Warnings de SWC fallback (binario opcional) |
| `npx tsc --noEmit` | ✅ Sin errores de tipos | Strict mode activo |
| `npm run lint` | ❌ Falló — asistente interactivo ESLint | Requiere `eslint.config.mjs` para CI |
| `npm audit --json` | **Critical: 1 (next), High: 2 (postcss, sharp)** | Ver sección C-S1, H-S1, H-S2 |
| `npm ls postcss sharp` | `postcss@8.5.32` (root) + `postcss@8.4.31` (next); `sharp@0.33.5` (next) | Ambas versiones vulnerables |
| Contraste WCAG (calculado) | `#b45309` on `#ffffff` = **5.02:1** (AA large ✅, AA normal ❌) | Ver R5 |
| HTML prerenderizado (`.next/server/app/`) | Tablas vacías en `/documents` y `/admin` — `<thead><tr></tr></thead>` | Confirmado defecto tabla sin encabezados |

---

## 5. Tokens Tailwind faltantes (no generados → clases inertes)

| Clase usada | Archivos afectados | Solución |
|-------------|-------------------|----------|
| `bg-primary/3`, `bg-primary/5` | `app/search/results/page.tsx:142`, `app/upload/page.tsx:288` | Usar arbitrary values: `bg-primary/[0.15]` `bg-primary/[0.3]` |
| `text-text-inverse` | `components/ui/button.tsx:67,69,126,127` | Añadir `textInverse: "var(--color-text-inverse)"` en `theme.extend.colors` |
| `border-border-strong` | `components/ui/card.tsx:45,47` | Añadir `borderStrong: "var(--color-border-strong)"` |
| `bg-secondary-hover`, `bg-destructive-hover` | `components/ui/button.tsx:65,71,124,128` | Añadir `secondaryHover`, `destructiveHover` en colores |
| `duration-160` | `components/ui/button.tsx:52` | Añadir `transitionDuration: { 160: "160ms" }` |
| `ring-3` | `app/documents/page.tsx:69` | Añadir `ringWidth: { 3: "3px" }` o usar `ring-3` (ya existe en v4) |
| `border-1` | — (buscado, no encontrado en fuente) | Añadir `borderWidth: { 1: "1px" }` |
| `shadow-xs` | `components/ui/card.tsx:45,47,48` | Añadir `boxShadow: { xs: "var(--shadow-xs)" }` |
| `top-1/6` | `app/page.tsx:49` | Añadir `top: { "1/6": "16.666%" }` |
| `underline-none` | `app/layout.tsx:41`, `components/ui/nav.tsx:42` | Añadir `textDecoration: { none: "none" }` o usar `no-underline` |
| `clamp(2rem, 5vw, 3rem)` | `app/page.tsx:32` | No es utilidad Tailwind — usar CSS directo en `globals.css` |
| `animate-pulse-custom` | `components/ui/skeleton.tsx:38`, `styles/animations.css:22` | Ya generada (`.animate-pulse-custom` existe en CSS) |

---

## 6. Archivos y líneas clave para reparación prioritaria (solo frontend)

| Prioridad | Archivo | Líneas | Acción |
|-----------|---------|--------|--------|
| 1 | `package.json` | 13 | `next: "^15.5.29"` + `npm install` |
| 2 | `app/auth/login/page.tsx` | 13-21 | Implementar handler login frontend (validación, loading, error, redirect) |
| 3 | `app/admin/page.tsx` | 36-42, 248-250 | Implementar approve/reject frontend (estado optimista, confirmación) + paginación real |
| 4 | `app/search/results/page.tsx` | 19-31 | Usar `filters` para filtrar array local antes de setear estado |
| 5 | `app/upload/page.tsx` | 62-120 | Validar `file.type` y `file.size` + input file accesible |
| 6 | `components/ui/dialog.tsx` | 62-89 | Refactor a `<dialog>` nativo con `showModal()` |
| 7 | `components/ui/dropdown.tsx` | 72-99 | Implementar ARIA Listbox + navegación teclado |
| 8 | `components/ui/button.tsx` | 78-91 | Corregir `asChild` con Radix Slot |
| 9 | `components/ui/pagination.tsx` | 84-92 | Quitar `disabled` en página activa; `aria-current="page"` |
| 10 | `components/ui/input.tsx` | 95-99 | `aria-describedby` dinámico para helper + error |
| 11 | `components/ui/table.tsx` | 63, 108 | `scope="col"` en `<th>` + `<caption>` |
| 12 | `components/ui/nav.tsx` | 81-120 | `aria-expanded/controls` + focus trap menú móvil |
| 13 | `tailwind.config.ts` | 1-36 | Añadir tokens faltantes (ver §5) |
| 14 | `eslint.config.mjs` | — | Crear config para `npm run lint` en CI |

---

## 7. Limitaciones de esta auditoría

1. **Solo lectura** — no se ejecutó la app en navegador, no se probaron interacciones reales con NVDA/JAWS/VoiceOver.
2. **Contraste** — calculado matemáticamente desde hex en `variables.css`; no verificado con axe/WebAIM en runtime.
3. **Preferencias de movimiento** — CSS respeta `prefers-reduced-motion`, pero no se probó con ajuste del SO activado.
4. **Cobertura de componentes** — se revisaron los 14 componentes en `components/ui/` y su uso en 8 páginas; otros usos fuera de alcance no auditados.
5. **Tailwind runtime** — se asume que clases utilitarias se resuelven vía `tailwind.config.ts`; se validó contra CSS generado en `.next/static/css/`.
6. **Sin tests** — hallazgos basados en inspección estática; no hay suite de regresión.

---

## 8. Próximos pasos recomendados (orden de ejecución, solo frontend)

1. **Actualizar dependencias críticas**: `npm install next@15.5.29` (arrastra `sharp` y `postcss` parcheados).
2. **Añadir tokens Tailwind faltantes** en `tailwind.config.ts` para que las clases inertes funcionen.
3. **Implementar lógica frontend de login**: validación, estado loading, feedback error, redirect client-side.
4. **Implementar lógica frontend de admin**: approve/reject con estado optimista + confirmación modal; paginación calculada desde array filtrado; búsqueda filtrando array local.
5. **Implementar lógica frontend de búsqueda**: filtros `status`/`dateRange` filtrando array local.
6. **Corregir accesibilidad crítica**: `<dialog>` nativo (focus trap nativo), ARIA Listbox en dropdown, `asChild` con Radix Slot, `aria-current="page"` en paginación, input file con `sr-only`.
7. **Centralizar datos de documentos** en `lib/data/documents.ts` (hook/shared module) para eliminar duplicación en 3 páginas.
8. **Añadir validación de archivo cliente** (tipo MIME + tamaño) en `upload/page.tsx` antes de simulación.
9. **Configurar ESLint** (`eslint.config.mjs` extends `next/core-web-vitals`) para CI.
10. **Introducir tests unitarios** (Vitest + React Testing Library) con cobertura en componentes UI y flujos críticos.
11. **Revisar contraste y tokens de color** (warning vs primary, dark mode toggle, fuentes).
12. **Implementar dark mode toggle** con `next-themes` (sin flash, persiste en localStorage).

---

## 9. Problema → Solución (Solo frontend, basadas en documentación oficial 2024-2026)

Esta sección mapea cada hallazgo crítico/alto **puramente de frontend** a su solución concreta con código de referencia, fuentes y criterios de aceptación. **No incluye** nada que requiera API, backend, MSW, o integración servidor.

---

### 9.1 Seguridad: Actualización de Next.js (C-S1, H-S1, H-S2)

**Problema:** `next@15.0.0` vulnerable a RCE en Image Optimization (SVG/AVIF), DoS en Server Actions/Components, lectura arbitraria de archivos via PostCSS sourceMappingURL, vulnerabilidades en Sharp (libvips/libheif/librsvg).

**Solución:** Actualizar a `15.5.29` (Maintenance LTS, soporte seguridad hasta 31-ene-2027). Este release parchea **7 advisories** de noviembre 2026 + 2 de octubre 2026.

```bash
# En rama dedicada, commit atómico con lockfile
npm install --save-exact next@15.5.29
# Verifica que sharp ≥ 0.35.5 y postcss ≥ 8.5.23 vengan transitivamente
npm ls sharp postcss
npm audit --json  # Debe reportar 0 critical/high para next/postcss/sharp
```

**Fuentes:** Next.js Security Release Nov 2026 (16.4.5 / 15.5.29), GHSA-p293-qw3h-jr36, GHSA-2464-fhr4-w9xw, GHSA-6g55-p6wh-862q, GHSA-f88m-g3jw-g9cj.

**Criterio de aceptación:** `npm audit` limpio para dependencias directas; build y tests pasan; `next dev` no muestra warning de versión vulnerable.

---

### 9.2 Login frontend completo (C-L1)

**Problema:** `handleLogin` es un no-op con comentario `TODO`.

**Solución:** Implementar handler frontend completo: validación cliente, estado loading, feedback error/éxito, redirect client-side. **Punto de integración** marcado para que el adoptante conecte su auth real.

```tsx
// app/auth/login/page.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
      
      // Simulación para plantilla:
      await new Promise(r => setTimeout(r, 800))
      
      router.push("/dashboard") // o ruta protegida de tu app
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email" placeholder="correo@ejemplo.com" value={email}
        onChange={e => setEmail(e.target.value)} label="Correo electrónico"
        disabled={isLoading} aria-invalid={!!error}
        aria-describedby={error ? "login-error" : undefined}
      />
      <Input
        type="password" placeholder="••••••••" value={password}
        onChange={e => setPassword(e.target.value)} label="Contraseña"
        disabled={isLoading} showPassword
        aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined}
      />
      {error && (
        <p id="login-error" role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isLoading} variant="primary" size="lg" className="w-full">
        {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
    </form>
  )
}
```

**Fuentes:** Next.js App Router Forms, React Hook Form patterns, WCAG 3.3.1 Error Identification.

**Criterio de aceptación:** Formulario valida cliente; muestra loading; muestra error con `role="alert"`; redirect tras éxito; **punto de integración documentado**.

---

### 9.3 Diálogo accesible con focus trap nativo (C-A1)

**Problema:** `Dialog` usa `role="dialog"` + `aria-modal="true"` pero **no atrapa foco**, no restaura foco al cerrar, y no inerte el fondo.

**Solución preferida (nativa, cero dependencias):** Usar `<dialog>` HTML nativo con `showModal()`. El navegador **inyecta automáticamente** inert en el fondo, atrapa Tab, y restaura foco al trigger.

```tsx
// components/ui/dialog.tsx
"use client"
import { forwardRef, useEffect, useRef, useId } from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, title, children, className }, ref) => {
    const dialogRef = ref
    const triggerRef = useRef<HTMLElement>(null)
    const titleId = useId()

    useEffect(() => {
      const dialog = dialogRef.current
      if (!dialog) return
      if (open && !dialog.open) {
        triggerRef.current = document.activeElement as HTMLElement
        dialog.showModal()
      } else if (!open && dialog.open) {
        dialog.close()
      }
    }, [open])

    useEffect(() => {
      const dialog = dialogRef.current
      if (!dialog) return
      const onCloseHandler = () => { onClose(); triggerRef.current?.focus() }
      dialog.addEventListener("close", onCloseHandler)
      return () => dialog.removeEventListener("close", onCloseHandler)
    }, [onClose])

    return (
      <dialog
        ref={dialogRef}
        className={cn("bg-surface border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4", className)}
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <h2 id={titleId} className="text-lg font-semibold text-text-primary mb-4">{title}</h2>
        )}
        <div className="flex flex-col gap-4">
          {children}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Cerrar
            </button>
          </div>
        </div>
        <form method="dialog" className="hidden"><button type="submit">Close</button></form>
      </dialog>
    )
  }
)
Dialog.displayName = "Dialog"

// Uso:
<Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Confirmar">
  <p>¿Seguro que quieres eliminar?</p>
</Dialog>
<button onClick={() => setIsOpen(true)}>Abrir</button>
```

**Fuentes:** MDN `<dialog>`, WAI-ARIA Dialog Pattern, React Aria Modal.

**Criterio de aceptación:** Tab/Shift+Tab cicla dentro del diálogo; Escape cierra y foco vuelve al trigger; NVDA/JAWS anuncian "diálogo" y título; fondo inerte (no focusable).

---

### 9.4 Dropdown/Listbox accesible (C-A2)

**Problema:** `Dropdown` renderiza botones sin `role="listbox"`, usa `aria-pressed` incorrecto, y **no tiene navegación por teclado**.

**Solución:** Implementar patrón **ARIA Listbox** (single-select) con `role="listbox"`, `aria-labelledby`, `aria-selected`, y navegación ArrowUp/Down/Home/End/Escape. Usar **React Aria `useListBox`** para comportamiento completo y robusto.

```tsx
// components/ui/dropdown.tsx
"use client"
import { useId, forwardRef } from "react"
import { useListBox, useSingleSelectListState } from "react-aria"
import { cn } from "@/lib/utils"

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  className?: string
  placeholder?: string
  label?: string
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ value, onChange, options, disabled, className, placeholder, label }, ref) => {
    const state = useSingleSelectListState({ selectedKey: value, onSelectionChange: onChange })
    const { labelProps, menuProps, buttonProps } = useListBox({ ...state }, ref)

    return (
      <div className={cn("relative inline-block", className)}>
        <label {...labelProps} className="sr-only">{label ?? "Seleccionar"}</label>
        <button
          {...buttonProps}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 text-sm text-text-primary rounded-md border border-border bg-surface",
            "hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {options.find(o => o.value === value)?.label ?? placeholder}
        </button>

        {menuProps.isOpen && (
          <div
            {...menuProps}
            className={cn(
              "absolute z-20 w-48 mt-2 origin-top-left rounded-md bg-surface border border-border shadow-lg",
              "overflow-hidden ring-1 divide-y divide-border animate-in fade-in slide-in-from-top-0"
            )}
          >
            {options.map(option => (
              <button
                key={option.value}
                {...state.getItemProps(option.value)}
                disabled={disabled}
                className={cn(
                  "flex w-full px-3 py-2 text-sm text-text-primary hover:bg-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "data-[selected=true]:bg-primary/10 data-[selected=true]:text-text-primary",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Dropdown.displayName = "Dropdown"
```

**Si no quieres React Aria:** Implementar `keydown` handler manual con ArrowUp/Down (wrap), Home/End, Escape, Enter/Space para seleccionar, y `aria-activedescendant` en el botón trigger.

**Fuentes:** WAI-ARIA Listbox Pattern, React Aria `useListBox`, APG Combobox/Listbox.

**Criterio de aceptación:** Tab abre el menú; ArrowUp/Down navegan con wrap; Home/End saltan a primera/última; Enter/Space selecciona y cierra; Escape cierra y foco vuelve al trigger; NVDA anuncia "listbox, X opciones, opción Y seleccionada".

---

### 9.5 Button asChild: nunca renderizar `<span>` (C-A3)

**Problema:** `asChild={true}` renderiza `<span>` con `disabled`, `aria-disabled`, `type` — inválido en span; rompe teclado y lectores.

**Solución:** Usar **Radix Slot** (patrón `asChild` canónico) que clona el hijo y **mergea props**, **exigiendo que el hijo sea un elemento interactivo nativo** (`<button>`, `<a>`, `<Link>`). **Nunca** renderizar `<span>`.

```tsx
// components/ui/button.tsx
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = "primary", size = "md", disabled = false, loading = false, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-md font-medium",
      size === "sm" ? "h-8 px-2 text-sm" : size === "lg" ? "h-10 px-4 text-lg" : "h-9 px-3 text-base",
      "transition-colors duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )

    const variantClasses = {
      primary: "bg-primary text-surface hover:bg-primary-hover active:scale-[0.97]",
      secondary: "bg-secondary text-text-inverse hover:bg-secondary-hover active:scale-[0.97]",
      success: "bg-success text-text-inverse hover:bg-success/90 active:scale-[0.97]",
      warning: "bg-warning text-text-inverse hover:bg-warning/90 active:scale-[0.97]",
      destructive: "bg-destructive text-text-inverse hover:bg-destructive-hover active:scale-[0.97]",
      ghost: "bg-transparent text-primary hover:bg-primary/5 active:scale-[0.97]",
      outline: "border border-primary text-primary hover:bg-primary/10 active:scale-[0.97]",
    } as const

    if (disabled && !loading) {
      return (
        <Comp ref={ref} className={cn(baseClasses, variantClasses[variant])} disabled aria-disabled="true" {...props}>
          {children}
        </Comp>
      )
    }

    if (loading) {
      return (
        <Comp ref={ref} className={cn(baseClasses, variantClasses[variant])} disabled aria-busy="true" {...props}>
          <span className="flex items-center gap-2">
            <span className="spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        </Comp>
      )
    }

    return (
      <Comp ref={ref} className={cn(baseClasses, variantClasses[variant])} disabled={disabled} {...props}>
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"
```

**Uso correcto:**
```tsx
<Button asChild><a href="/dashboard">Dashboard</a></Button>  // ✅ Link nativo
<Button asChild><Link href="/dashboard">Dashboard</Link></Button>  // ✅ Next Link
```

**Fuentes:** Radix UI Slot, Radix Composition Guide, Polymorphic React Components.

**Criterio de aceptación:** `asChild` con `<a>` o `<Link>` renderiza **un solo elemento** en DOM; hereda estilos y handlers; accesible por teclado; TypeScript valida props del hijo.

---

### 9.6 Paginación: `aria-current="page"` en activo, `disabled` solo en bordes (C-A4)

**Problema:** Página activa tiene `disabled={true}` → sale del orden de tabulación.

**Solución:** **Nunca** deshabilitar la página activa. Usar `aria-current="page"` para marcarla programáticamente; estilizar con `[aria-current="page"]`. Usar `disabled` nativo **solo** en botones Prev/Next en primera/última página.

```tsx
// components/ui/pagination.tsx
export const Pagination = ({ currentPage, totalPages, onPageChange, className }: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className={cn("mt-4 flex", className)} aria-label="Paginación">
      <ul className="flex items-center gap-1">
        <li>
          <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Página anterior" className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            currentPage <= 1 ? "text-text-muted" : "text-text-primary hover:text-primary"
          )}>Anterior</button>
        </li>

        {pages.map(page => (
          <li key={page}>
            <button type="button" onClick={() => onPageChange(page)} aria-current={page === currentPage ? "page" : undefined} aria-label={`Página ${page}`} className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              page === currentPage ? "bg-primary text-surface" : "text-text-primary hover:bg-primary/10"
            )}>{page}</button>
          </li>
        ))}

        <li>
          <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Página siguiente" className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            currentPage >= totalPages ? "text-text-muted" : "text-text-primary hover:text-primary"
          )}>Siguiente</button>
        </li>
      </ul>
    </nav>
  )
}
```

**CSS (globals.css o @utility):**
```css
.pagination button[aria-current="page"] {
  font-weight: 700;
  outline: 2px solid var(--color-primary);
}
```

**Fuentes:** WAI-ARIA Pagination Pattern, USWDS Pagination, shadcn/ui Pagination.

**Criterio de aceptación:** Tab llega a página activa; NVDA anuncia "página 3, current page, button"; Prev/Next deshabilitados en bordes no son focusables; estilos visual y programático nunca divergen.

---

### 9.7 Input file accesible (C-A5)

**Problema:** `<input type="file" className="hidden">` → `display:none` lo saca del árbol de accesibilidad.

**Solución:** Usar **visually-hidden** (clip-path / `sr-only`) + `<label>` como dropzone. El input **permanece en el tab order**; click en label abre picker nativamente.

```tsx
// app/upload/page.tsx (zona de upload)
const fileInputRef = useRef<HTMLInputElement>(null)

<label
  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 sm:p-12 cursor-pointer
             hover:border-primary/5 hover:bg-primary/5 transition-colors
             focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
  onDragOver={e => e.preventDefault()}
  onDrop={e => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) handleFile(f) }}
>
  <svg className="w-12 h-12 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">...</svg>
  <span className="text-xl font-semibold text-text-primary">Arrastra y suelta un archivo aquí</span>
  <p className="text-text-secondary">Formatos compatibles: PDF, DOCX, XLSX, TXT (máx. 50 MB)</p>

  <input
    ref={fileInputRef}
    type="file"
    id="file-upload"
    className="sr-only"
    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
    accept=".pdf,.docx,.xlsx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
  />
  <Button variant="primary" type="button" className="w-full sm:w-auto" onClick={() => fileInputRef.current?.click()}>
    Seleccionar archivo
  </Button>
</label>
```

**Anuncio de selección (status region):**
```tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null)
// En handleFile: setSelectedFile(file)
<output id="file-status" className="sr-only" aria-live="polite" role="status">
  {selectedFile ? `Archivo seleccionado: ${selectedFile.name}, ${formatFileSize(selectedFile.size)}` : "Ningún archivo seleccionado"}
</output>
<input ... aria-describedby="file-status" />
```

**Fuentes:** MDN Accessible File Input, Modern Framework Accessibility File Upload, react-dropzone #935.

**Criterio de aceptación:** Tab llega al input; Enter/Space abre picker; NVDA anuncia "file upload, drag and drop or click to browse"; selección se anuncia en live region; drag-and-drop funciona como mejora progresiva.

---

### 9.8 Validación de archivo cliente (C-L4)

**Problema:** UI dice "PDF, DOCX, XLSX, TXT (máx. 50 MB)" pero `handleFile` no valida nada.

**Solución:** Validar **MIME type** (`file.type`) y **tamaño** (`file.size`) **antes** de procesar; mostrar error inline asociado al input con `aria-describedby` + `role="alert"`.

```ts
// lib/validation.ts
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Tipo de archivo no permitido: ${file.type || "desconocido"}. Use PDF, DOCX, XLSX o TXT.`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `El archivo excede el límite de 50 MB (actual: ${(file.size / 1024 / 1024).toFixed(1)} MB).`
  }
  return null
}
```

```tsx
// app/upload/page.tsx
import { validateFile } from "@/lib/validation"

const handleFile = (file: File) => {
  const error = validateFile(file)
  if (error) {
    setUploadError(error)
    setIsUploading(false)
    return
  }
  // ... lógica existente de subida simulada
}
```

> **Nota:** La validación cliente es **UX, no seguridad**. Documentar que el backend DEBE re-validar (magic bytes, antivirus, cuotas).

**Fuentes:** Filestack React File Upload, Syncfusion Validation, OWASP File Upload Security.

**Criterio de aceptación:** Seleccionar `.exe` muestra error inline; seleccionar 60 MB muestra error; PDF 10 MB pasa; error se anuncia via `aria-describedby` + `role="alert"`.

---

### 9.9 Admin: approve/reject + paginación + búsqueda (C-L2, H-L1, H-L2) — Solo frontend

**Problema:** `handleApprove/Reject` solo `console.log`; paginación hardcodeada; búsqueda no filtra.

**Solución:** Implementar lógica **puramente frontend**:
- Estado optimista para approve/reject con confirmación modal
- Paginación calculada desde array filtrado (`totalPages = Math.ceil(filtered.length / perPage)`)
- Búsqueda filtrando `pendingDocs` por `searchQuery` antes de renderizar

```tsx
// app/admin/page.tsx (extracto)
const [statusFilter, setStatusFilter] = useState<string | undefined>()
const [searchQuery, setSearchQuery] = useState("")
const [currentPage, setCurrentPage] = useState(1)
const [pendingConfirmation, setPendingConfirmation] = useState<{id: number, action: "approve"|"reject"} | null>(null)

const filteredDocs = documents.filter(doc => !statusFilter || doc.status === statusFilter)
const pendingDocs = filteredDocs.filter(doc => doc.status === "pending")
const searchedDocs = pendingDocs.filter(doc => 
  doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  doc.type.toLowerCase().includes(searchQuery.toLowerCase())
)

const perPage = 5
const totalPages = Math.ceil(searchedDocs.length / perPage)
const paginatedDocs = searchedDocs.slice((currentPage - 1) * perPage, currentPage * perPage)

const handleApprove = (id: number) => setPendingConfirmation({ id, action: "approve" })
const handleReject = (id: number) => setPendingConfirmation({ id, action: "reject" })

const confirmAction = () => {
  if (!pendingConfirmation) return
  // Estado optimista frontend
  setDocuments(prev => prev.map(d => d.id === pendingConfirmation.id 
    ? { ...d, status: pendingConfirmation.action === "approve" ? "approved" : "rejected" }
    : d))
  setPendingConfirmation(null)
}

// En JSX: tabla usa paginatedDocs; Paginación usa totalPages; onPageChange=setCurrentPage
// Modal de confirmación usa pendingConfirmation
```

**Criterio de aceptación:** Aprobar/Rechazar muestra modal confirmación → actualiza tabla sin recarga; paginación calculada dinámicamente; búsqueda filtra en cliente; loading states en botones.

---

### 9.10 Búsqueda: filtros funcionales frontend (C-L3)

**Problema:** `filters` (status, dateRange) se capturan pero `handleSearch` ignora y devuelve hardcodeado.

**Solución:** Filtrar array local por `filters.status` y `filters.dateRange` antes de setear estado `results`.

```tsx
// app/search/results/page.tsx
const handleSearch = () => {
  if (!query.trim()) return
  setSearching(true)
  setTimeout(() => {
    let filtered = MOCK_RESULTS.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase())
    )
    if (filters.status) filtered = filtered.filter(r => r.status === filters.status)
    if (filters.dateRange) {
      // lógica simple: filtrar por mes/año según dateRange
      const now = new Date()
      filtered = filtered.filter(r => {
        const docDate = new Date(r.date)
        if (filters.dateRange === "this-month") 
          return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
        if (filters.dateRange === "last-month") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
          return docDate.getMonth() === lastMonth.getMonth() && docDate.getFullYear() === lastMonth.getFullYear()
        }
        return true
      })
    }
    setResults(filtered)
    setSearching(false)
  }, 800)
}
```

**Criterio de aceptación:** Cambiar status/dateRange actualiza resultados mostrados; combinación de query + filtros funciona; loading state durante búsqueda.

---

### 9.11 Centralizar datos de documentos (H-L3) — Solo frontend

**Problema:** Tres páginas (`documents`, `search/results`, `admin`) definen arrays `documents` duplicados con estructuras distintas.

**Solución:** Crear **shared module** `lib/data/documents.ts` con tipado único y datos base; cada página importa y filtra/transforma según necesidad.

```ts
// lib/data/documents.ts
export interface Document {
  id: number
  title: string
  type: "PDF" | "DOCX" | "XLSX" | "TXT"
  date: string // ISO
  uploader: string
  status: "pending" | "approved" | "rejected"
  size?: string
  relevance?: string
}

export const BASE_DOCUMENTS: Document[] = [
  { id: 1, title: "Informe trimestral Q4 2023", type: "PDF", date: "2024-01-15", uploader: "Marcos", status: "approved", size: "2.4 MB" },
  { id: 2, title: "Manual de usuario v2.1", type: "DOCX", date: "2024-01-10", uploader: "Sistema", status: "pending", size: "1.8 MB" },
  { id: 3, title: "Presupuesto anual 2024", type: "XLSX", date: "2024-01-05", uploader: "Marcos", status: "pending", size: "850 KB" },
  { id: 4, title: "Política de seguridad", type: "PDF", date: "2024-01-01", uploader: "Sistema", status: "approved", size: "3.1 MB" },
  { id: 5, title: "Manual de cumplimiento", type: "PDF", date: "2023-12-20", uploader: "Marcos", status: "rejected", size: "2.9 MB" },
]

export function getDocumentsForPage(page: "documents" | "admin" | "search"): Document[] {
  // Cada página puede transformar/filtrar según necesidad
  return BASE_DOCUMENTS
}
```

**Uso en páginas:**
```tsx
// app/documents/page.tsx
import { getDocumentsForPage, Document } from "@/lib/data/documents"
const documents = getDocumentsForPage("documents")
// app/admin/page.tsx
import { getDocumentsForPage } from "@/lib/data/documents"
const documents = getDocumentsForPage("admin")
// app/search/results/page.tsx
import { getDocumentsForPage } from "@/lib/data/documents"
const MOCK_RESULTS = getDocumentsForPage("search")
```

**Criterio de aceptación:** Una sola fuente de verdad (`BASE_DOCUMENTS`); cambios en estructura se hacen en un lugar; TypeScript valida consistencia.

---

### 9.12 Input: `aria-describedby` para helper + error (H-A1)

**Problema:** `helper` tiene `id="input-helper"` pero no está en `aria-describedby`.

**Solución:** Construir `describedBy` dinámicamente combinando `helperId` y `errorId`; usar `useId` para IDs estables.

```tsx
// components/ui/input.tsx
import { useId } from "react"

export const Input = ({ ..., helper, error, ... }: InputProps) => {
  const inputId = useId()
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`

  const describedBy = [
    helper ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(" ") || undefined

  return (
    <div className="space-y-2">
      {label && <label htmlFor={inputId} className="...">{label}</label>}
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          ...
        />
        {helper && <p id={helperId} className="text-text-secondary text-xs mt-1">{helper}</p>}
        {error && <p id={errorId} className="text-destructive text-xs mt-1" role="alert">{error}</p>}
      </div>
    </div>
  )
}
```

**Fuentes:** WAI-ARIA aria-describedby, React useId, Accessible React Forms.

**Criterio de aceptación:** NVDA al enfocar input anuncia label + helper (si no hay error) o label + error; `aria-invalid` refleja estado; IDs únicos por instancia.

---

### 9.13 Tablas: `<caption>` + `scope="col"` (H-A2, H-A3)

**Problema:** `<th>` sin `scope="col"`; tablas sin nombre accesible.

**Solución:** Añadir `<caption>` como primer hijo de `<table>` (puede ser `sr-only` si hay heading visible) y `scope="col"` en **cada** `<th>`.

```tsx
// components/ui/table.tsx
export const Table = ({ className, children, caption, ... }: TableProps & { caption?: string }) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full rounded-md border border-border bg-background text-sm", className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        {headerChildren.map((col, i) => (
          <tr key={i} className="bg-secondary/5 border-b border-border text-text-secondary font-medium text-xs tracking-wider">
            {React.Children.toArray(col.children).map((cell, ci) => (
              <th key={ci} scope="col" className="px-3 py-2 border-b border-border text-left" colSpan={cell.props.colSpan}>
                {cell.props.children}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>...</tbody>
    </table>
  </div>
)
```

**Uso:**
```tsx
<Table caption="Documentos pendientes de revisión">
  <TableHeader><th>Título</th><th>Tipo</th>...</TableHeader>
  <TableRow>...</TableRow>
</Table>
```

**Fuentes:** MDN Table Accessibility, W3C Tables Tutorial.

**Criterio de aceptación:** NVDA al entrar a tabla anuncia "table, Documentos pendientes de revisión, 5 columnas, 3 filas"; navegar por columnas anuncia header + valor; `scope="col"` en todos los `<th>`.

---

### 9.14 Nav móvil: `aria-expanded`, `aria-controls`, focus trap (H-A4)

**Problema:** Hamburger sin `aria-expanded`/`aria-controls`; menú sin gestión de foco.

**Solución:** Botón nativo `<button>` con `aria-expanded`, `aria-controls`, `aria-label` dinámico; `inert` en contenido principal al abrir; focus trap en panel; Escape cierra y restaura foco.

```tsx
// components/ui/nav.tsx
"use client"
import { useState, useRef, useEffect, useId } from "react"
import { cn } from "@/lib/utils"

export const Nav = ({ brand, links, className, mobile = true }: NavProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    const main = document.getElementById("main-content")
    if (isOpen) {
      main?.setAttribute("inert", "")
      panelRef.current?.querySelector("a, button")?.focus()
    } else {
      main?.removeAttribute("inert")
      buttonRef.current?.focus()
    }
    return () => main?.removeAttribute("inert")
  }, [isOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) { setIsOpen(false); buttonRef.current?.focus() } }
    if (isOpen) window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen])

  return (
    <nav className={cn("bg-surface border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between h-16">
          <span className="text-text-primary font-medium">{brand}</span>
          <div className="hidden md:block">
            <ul className="flex items-center gap-3" role="list">
              {links.map((link, i) => (<li key={link.href}><a href={link.href} className="...">{link.label}</a></li>))}
            </ul>
          </div>
          {mobile && (
            <button ref={buttonRef} type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls={panelId} aria-label={isOpen ? "Cerrar menú" : "Abrir menú"} className="md:hidden p-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24">...</svg>
            </button>
          )}
        </div>
        {isOpen && (
          <div ref={panelRef} id={panelId} role="navigation" aria-label="Menú principal" className="md:hidden fixed inset-0 z-50 bg-surface p-4">
            <ul className="flex flex-col gap-2">
              {links.map((link, i) => (
                <li key={link.href}><a href={link.href} className="block p-3 rounded-md hover:bg-primary/5" onClick={() => setIsOpen(false)}>{link.label}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
```

**En layout.tsx:** `<main id="main-content">...</main>`

**Fuentes:** WAI-ARIA Disclosure Pattern, A11yPath Responsive Nav.

**Criterio de aceptación:** Tab abre menú; panel recibe foco; Tab cicla dentro del panel; Escape cierra y foco vuelve al hamburguesa; fondo inerte; NVDA anuncia "menú expandido/colapsado".

---

### 9.15 Breadcrumb: `aria-current="page"` + `aria-hidden` en separadores (H-A5)

**Problema:** Sin `aria-current` en ítem actual; separadores `/` leídos por lectores.

**Solución:** `<nav aria-label="Breadcrumb"><ol>...`; último ítem con `aria-current="page"`; separadores en `<li aria-hidden="true">` o mejor, **CSS `::before`** (no en DOM).

```tsx
// components/ui/breadcrumb.tsx
export const Breadcrumb = ({ items, className }: BreadcrumbProps) => (
  <nav className={cn("flex items-center gap-1", className)} aria-label="Navegación">
    <ol className="flex items-center gap-1 list-none">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={item.href ?? item.label ?? index}>
            <li>
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="text-text-secondary">{item.label}</span>
              ) : (
                <a href={item.href} className="text-text-secondary hover:text-primary">{item.label}</a>
              )}
            </li>
            {!isLast && <li aria-hidden="true" className="text-text-muted select-none">/</li>}
          </React.Fragment>
        )
      })}
    </ol>
  </nav>
)
```

**Mejor (CSS-only separator):**
```css
.breadcrumb ol { display: flex; flex-wrap: wrap; gap: 0.25rem; list-style: none; }
.breadcrumb li + li::before { content: "/"; margin-left: 0.25rem; color: var(--color-text-muted); }
```

**Fuentes:** WAI-ARIA Breadcrumb Pattern, shadcn/ui Breadcrumb.

**Criterio de aceptación:** NVDA anuncia "breadcrumb, navigation, list, 3 items"; último item "Página actual, current page"; separadores no anunciados.

---

### 9.16 EmptyState: botón con focus ring del sistema (H-A6)

**Problema:** Acción string renderiza `<button>` con estilos inline, sin focus ring consistente.

**Solución:** Usar componente `Button` compartido o aplicar `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.

```tsx
// components/ui/empty-state.tsx
{action ? (
  <div className="flex gap-2">
    {typeof action === "string" ? (
      <Button variant="primary" size="sm" className="w-auto">{action}</Button>
    ) : (action)}
  </div>
) : null}
```

**Fuentes:** Design System Button Focus States, WCAG 2.4.7 Focus Visible.

**Criterio de aceptación:** Tab llega al botón; focus ring visible idéntico a otros botones; color/estilo consistente.

---

### 9.17 Tailwind: tokens faltantes (R8, §5)

**Problema:** Clases como `bg-primary/3`, `text-text-inverse`, `duration-160`, `ring-3`, `shadow-xs`, `clamp()` no generadas → inertes.

**Solución:** Definir tokens en `@theme` (Tailwind v4) o `theme.extend` (v3). Para one-offs genuinos, usar **arbitrary values**.

```ts
// tailwind.config.ts (v3 theme.extend)
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        textInverse: "var(--color-text-inverse)",
        borderStrong: "var(--color-border-strong)",
        secondaryHover: "var(--color-secondary-hover)",
        destructiveHover: "var(--color-destructive-hover)",
      },
      boxShadow: { xs: "var(--shadow-xs)" },
      ringWidth: { 3: "3px" },
      borderWidth: { 1: "1px" },
      transitionDuration: { 160: "160ms" },
      top: { "1/6": "16.666%" },
      textDecoration: { none: "none" },
    },
  },
}
export default config
```

**Para `clamp()` y opacity fraccionales:** Usar arbitrary values en JSX:
```tsx
className="bg-primary/[0.15]"  // en lugar de bg-primary/3
className="[font-size:clamp(2rem,5vw,3rem)]"  // arbitrary property
```

**Fuentes:** Tailwind v4 Theme Variables, Arbitrary Values, Custom Utilities.

**Criterio de aceptación:** Build genera las clases; DevTools muestra CSS aplicado; no hay clases inertes en HTML final.

---

### 9.18 ESLint: config flat para CI (R10, M-S1)

**Problema:** `npm run lint` lanza asistente interactivo; no hay `eslint.config.mjs`.

**Solución:** Crear `eslint.config.mjs` (Flat Config ESLint 9+) extendiendo `next/core-web-vitals` y `next/typescript`.

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import tailwind from "eslint-plugin-tailwindcss"

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  { plugins: { tailwind }, rules: { ...tailwind.configs.recommended.rules, "tailwindcss/no-custom-classname": "warn" } },
  globalIgnores([".next/**", "node_modules/**", "out/**", "next-env.d.ts"]),
])
```

```json
// package.json scripts
"scripts": {
  "lint": "eslint . --ext .ts,.tsx",
  "lint:fix": "eslint . --ext .ts,.tsx --fix",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "ci": "npm run typecheck && npm run lint && npm run test"
}
```

```bash
npm i -D eslint eslint-config-next @eslint/eslintrc eslint-plugin-tailwindcss vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

**Fuentes:** Next.js ESLint Config (v15), ESLint 9 Flat Config, TailwindCSS ESLint Plugin.

**Criterio de aceptación:** `npm run lint` pasa en CI sin interacción; `npm run typecheck` pasa; `npm run test` ejecuta tests.

---

### 9.19 Contraste: primary en texto normal (R5, R6)

**Problema:** `--color-primary #b45309` sobre blanco = **5.02:1** (AA large ✅, AA normal ❌ 4.5:1). `--color-warning` = `--color-primary` (duplicado semántico).

**Solución:** Usar `--color-primary-hover #92400e` (6.1:1) para **texto normal** sobre blanco; reservar `#b45309` para **texto grande** (≥18pt/14pt bold) y fondos de botones. Distinguir `warning` con amber-600 `#ca8a04`.

```css
/* styles/variables.css */
:root {
  --color-primary: #b45309;
  --color-primary-hover: #92400e;  /* para texto normal */
  --color-primary-light: #fdba74;
  --color-warning: #ca8a04;        /* distinto de primary */
  --color-warning-hover: #a16207;
}
```

**En componentes:** Cambiar `text-primary` a `text-primary-hover` en textos de tamaño normal.

**Fuentes:** WCAG 1.4.3, WebAIM Contrast Checker, Accessible Color Systems Guide 2026.

**Criterio de aceptación:** Todos los pares texto/fondo en light mode ≥ 4.5:1; dark mode re-verificado; warning visualmente distinto de primary.

---

### 9.20 Dark mode: toggle persistente sin flash (R7)

**Problema:** `darkMode: "class"` pero sin toggle; solo `prefers-color-scheme`.

**Solución:** Instalar `next-themes`; `ThemeProvider` con `attribute="class"`, `defaultTheme="system"`, `enableSystem`; toggle con `mounted` guard.

```bash
npm install next-themes
```

```tsx
// components/theme-provider.tsx
"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ReactNode } from "react"
export function ThemeProvider({ children, ...props }: { children: ReactNode } & Record<string, unknown>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

```tsx
// components/ui/theme-toggle.tsx
"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" aria-hidden="true" />
  const isDark = resolvedTheme === "dark"
  return (
    <Button variant="ghost" size="sm" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
```

**En nav:** `<ThemeToggle />` en header.

**Fuentes:** next-themes Docs, Next.js Dark Mode Guides.

**Criterio de aceptación:** Sin flash (FOIT) en carga; toggle alterna light/dark/system; preferencia guardada en localStorage; `dark:` clases Tailwind funcionan; SSR/CSR consistente.

---

### 9.21 Fuentes: Geist + Playfair Display con next/font (R9)

**Problema:** `--font-geist-sans`, `--font-geist-mono`, `--font-playfair-display` referenciadas pero sin carga real.

**Solución:** Usar `next/font/google` para Geist y Playfair Display; definir en `app/fonts.ts`; aplicar variables en `<html>`.

```ts
// app/fonts.ts
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
export const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" })
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })
export const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display", display: "swap" })
```

```tsx
// app/layout.tsx
import { geistSans, geistMono, playfairDisplay } from "./fonts"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

```ts
// tailwind.config.ts
theme: { extend: { fontFamily: { sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"], mono: ["var(--font-geist-mono)", "monospace"], display: ["var(--font-playfair-display)", "Georgia", "serif"] } } }
```

**Fuentes:** Next.js Font Optimization, Vercel Geist Font, next/font API.

**Criterio de aceptación:** Build descarga fuentes (sin red externa); `<html>` tiene variables CSS; `font-sans`/`font-mono`/`font-display` funcionan en JSX; CLS = 0; `display: swap` evita FOIT.

---

## 10. Checklist de validación post-reparación (solo frontend)

| # | Validación | Comando / Herramienta | Criterio de pase |
|---|------------|----------------------|------------------|
| 1 | Dependencias seguras | `npm audit --json` | 0 critical, 0 high en next/postcss/sharp |
| 2 | Build Next.js | `npm run build` | ✅ 9 páginas estáticas, sin warnings de clases inertes |
| 3 | TypeScript | `npm run typecheck` | 0 errores |
| 4 | Lint | `npm run lint` | 0 errores, 0 warnings (o solo permitidos) |
| 5 | Tests unitarios | `npm run test` | Cobertura ≥ 80% en componentes UI y flujos críticos |
| 6 | Accesibilidad automatizada | `npx @axe-core/cli .next/server/app/**/*.html` | 0 violations critical/serious |
| 7 | Navegación teclado | Manual (Tab, Shift+Tab, Enter, Space, Escape, Arrows) | Todos los flujos operables sin ratón |
| 8 | Lectores de pantalla | NVDA (Windows) / VoiceOver (macOS) | Diálogos, dropdowns, tablas, nav, formularios anunciados correctamente |
| 9 | Contraste | axe DevTools / WebAIM Contrast Checker | Todos los pares texto/fondo ≥ 4.5:1 (AA) en light y dark |
| 10 | Dark mode | Manual + DevTools | Toggle funciona, persiste, sin flash, `dark:` clases aplicadas |
| 11 | Subida archivo | Manual | Validación cliente rechaza .exe/60MB; PDF 10MB pasa; error anunciado |
| 12 | Login frontend | Manual | Validación cliente, loading, error `role="alert"`, redirect |
| 13 | Admin CRUD frontend | Manual | Approve/Reject → modal confirmación → estado optimista → tabla actualizada |
| 14 | Búsqueda frontend | Manual | Filtros status/dateRange → resultados filtrados en cliente |
| 15 | Paginación | Manual | Tab llega a página activa; Prev/Next deshabilitados en bordes |
| 16 | Centralización datos | Revisión código | `lib/data/documents.ts` usado en 3 páginas; sin duplicación |

---

*Fin del informe. Generado a partir de auditoría estática multi-agente + investigación de fuentes oficiales (Next.js, React Aria, WAI-ARIA, WCAG 2.2, TanStack Query, next-themes, Tailwind CSS v4, ESLint 9). Solo problemas y soluciones **puramente frontend**.*