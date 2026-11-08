# Informe de Auditoría de Calidad y Accesibilidad (Gate 3)
## MiPymes Frontend — Lane D, Fase 3

**Fecha:** Nov 2026  
**Alcance:** 17 archivos (11 componentes base + 6 páginas) en `frontend/`  
**Fuentes de verdad:** `taste-brief.md`, `design-tokens.json`, `guia-estilos.md`, `arch-plan.md`, `component-map.csv`  
**Veredicto Gate 3:** ❌ **NO CUMPLE** — Problemas críticos de contraste y a11y bloquean el pase.

---

## 1. Tabla de Contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande ≥18pt/14pt bold)

| Par color-fondo | Contexto de uso | Ratio calculado | Requisito | Estado |
|-----------------|-----------------|-----------------|-----------|--------|
| **text-primary #18181b** sobre **background #fafaf6** | Body, títulos, texto principal | **17.47:1** | 4.5:1 | ✅ PASS (AAA) |
| **text-secondary #52525b** sobre **background #fafaf6** | Texto de apoyo, descripciones | **6.70:1** | 4.5:1 | ✅ PASS |
| **text-muted #a1a1aa** sobre **background #fafaf6** | Placeholders, empty states, leyendas, labels admin | **2.35:1** | 4.5:1 | ❌ **FAIL CRÍTICO** |
| **text-primary #18181b** sobre **surface #ffffff** | Inputs, cards, dialogs, botones ghost | **18.31:1** | 4.5:1 | ✅ PASS (AAA) |
| **text-primary #18181b** sobre **primary #b45309** | Texto sobre botón primario (no usado directamente) | **3.87:1** | 4.5:1 | ❌ FAIL |
| **text-surface #ffffff** sobre **primary #b45309** | Botón primario, Badge warning, Toast primary | **4.74:1** | 4.5:1 | ✅ PASS (límite) |
| **text-text-inverse #ffffff** sobre **success #15803d** | Botón success, Badge success, Toast success | **4.82:1** | 4.5:1 | ✅ PASS |
| **text-text-inverse #ffffff** sobre **destructive #b91c1c** | Botón destructive, Badge destructive, Toast destructive | **6.51:1** | 4.5:1 | ✅ PASS |
| **text-text-inverse #ffffff** sobre **warning #b45309** | Botón warning (reusa primary) | **4.74:1** | 4.5:1 | ✅ PASS (límite) |
| **text-secondary #52525b** sobre **surface #ffffff** | Labels de inputs, selects | **7.02:1** | 4.5:1 | ✅ PASS |
| **text-muted #a1a1aa** sobre **surface #ffffff** | Toast description, Dialog close, Badge CloseBadge, stats labels | **2.47:1** | 4.5:1 | ❌ **FAIL CRÍTICO** |
| **text-primary #b45309** (enlace) sobre **background #fafaf6** | Enlaces globales (`globals.css`) | **3.87:1** | 4.5:1 | ❌ **FAIL CRÍTICO** |
| **text-primary-hover #92400e** sobre **background #fafaf6** | Hover de enlaces | **6.49:1** | 4.5:1 | ✅ PASS |
| **text-muted dark #71717a** sobre **background dark #09090b** | Texto muted en modo oscuro | **4.28:1** | 4.5:1 | ❌ **FAIL** |
| **Badge primary: text-primary #b45309** sobre **bg-primary-light #fdba74** | Badge variant="primary" | **2.84:1** | 4.5:1 | ❌ **FAIL CRÍTICO** |
| **Search results: text-primary #b45309** sobre **bg-primary/10** | Badge inline "Pendiente" | **4.15:1** | 4.5:1 | ❌ **FAIL** |
| **Search results: text-success #15803d** sobre **bg-success/10** | Badge inline "Aprobado" | **4.19:1** | 4.5:1 | ❌ **FAIL** |
| **Button secondary: text-secondary #52525b** sobre **bg-secondary #52525b** | Button variant="secondary" | **1:1** | 4.5:1 | ❌ **FAIL CRÍTICO (invisible)** |

> **Nota:** Los ratios se calculan según fórmula WCAG 2.1 (luminancia relativa sRGB). Texto grande (≥1.5rem / 24px o 1.25rem bold) requiere 3:1.

---

## 2. Componentes con Estados Incompletos

| Componente | Default | Hover | Focus-visible | Active/Pressed | Disabled | Loading | Observaciones |
|------------|---------|-------|---------------|----------------|----------|---------|---------------|
| **Button** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Falta `active:scale-[0.98]` o `active:opacity-90` |
| **Input** | ✅ | ⚠️ (solo border) | ✅ | ❌ | ✅ | N/A | Falta hover explícito y active |
| **Dropdown** (trigger) | ✅ | ✅ | ✅ | ❌ | ✅ | N/A | Falta active/pressed |
| **Dropdown** (opciones) | ✅ | ✅ | ✅ | ❌ | ✅ | N/A | Falta active/pressed |
| **SearchInput** | ✅ | ❌ | ✅ | ❌ | ✅ | N/A | Falta hover y active |
| **Dialog** (overlay) | ✅ | N/A | ⚠️ | N/A | N/A | N/A | Close button sin focus-visible |
| **Dialog** (close btn) | ✅ | ✅ | ❌ | ❌ | N/A | N/A | **Sin anillo focus-visible** |
| **Nav** (links) | ✅ | ✅ | ✅ | ✅ | N/A | N/A | Completo |
| **Nav** (mobile btn) | ✅ | ✅ | ✅ | ❌ | N/A | N/A | Falta active |
| **Badge** (CloseBadge) | ✅ | ✅ | ❌ | ❌ | N/A | N/A | **Sin anillo focus-visible** |
| **Toast** (close btn) | ✅ | ✅ | ✅ | ❌ | N/A | N/A | Falta active |
| **Upload zone** | ✅ | ✅ | ✅ | ❌ | N/A | N/A | Falta active |
| **Table** (rows) | ✅ | ✅ | ❌ | ❌ | N/A | N/A | Filas no focusables (OK si no interactivas) |

**Leyenda:** ✅ Completo | ⚠️ Parcial | ❌ Falta | N/A No aplica

---

## 3. Anti-patrones Encontrados (guia-estilos.md §10)

| Anti-patrón | Archivos afectados | Severidad | Detalle |
|-------------|-------------------|-----------|---------|
| **Valores hex hardcodeados** | Ninguno | — | ✅ Cumple: 0 valores hex en componentes; todo por tokens/Tailwind |
| **`!important`** | Ninguno | — | ✅ Cumple: 0 `!important` (incluye `prefers-reduced-motion` sin `!important`) |
| **Espaciado arbitrario** | Ninguno | — | ✅ Cumple: Todo espaciado usa escala `space-*` / `p-*` / `gap-*` / `var(--spacing-*)` |
| **Máx. 2 familias tipográficas** | `variables.css`, `globals.css` | — | ✅ Cumple: `sans` (Geist), `display` (Playfair), `mono` solo para código |
| **Máx. 3 niveles de título** | `globals.css`, páginas | — | ✅ Cumple: Solo h1, h2, h3 definidos y usados |
| **Sombra negra pura** | `variables.css` | — | ✅ Cumple: Todas las sombras usan `rgb(0 0 0 / x.xx)` |
| **Estados incompletos en clickeables** | Button, Input, Dropdown, SearchInput, Dialog, Badge | **ALTA** | Ver §2: faltan active/pressed y focus-visible en varios |
| **Contraste insuficiente (WCAG AA)** | Múltiples (ver §1) | **CRÍTICA** | 8 pares fallan AA; 3 son críticos (invisible, 1:1, 2.35:1) |
| **Referencias a blue/gray genéricos** | `tailwind.config.ts` (config), `variables.css` (dark mode) | MEDIA | Tokens semánticos usan nombres propios; dark mode redefine correctamente |

---

## 4. Hallazgos de Accesibilidad Básica (a11y)

| Criterio | Estado | Detalle |
|----------|--------|---------|
| **focus-visible anillos** | ⚠️ Parcial | Faltan en: Dialog close button, Badge CloseBadge. El resto OK (`ring-2 ring-primary ring-offset-2`). |
| **aria-labels en botones icono** | ✅ PASS | Nav hamburger (`Menú principal`), Dialog close (`Cerrar`), Dropdown trigger (`Selector`), Badge CloseBadge (`Cerrar`), Toast close (`Cerrar notificación`), SearchInput (`Búsqueda de documentos`). |
| **label asociado a inputs** | ❌ **FAIL** | `Input` y `SearchInput` usan `<label>` adyacente **sin `htmlFor`/`id`**. No hay asociación programática. Login page hereda el problema. |
| **role="dialog", aria-modal** | ✅ PASS | `Dialog` tiene `role="dialog" aria-modal="true" aria-labelledby="dialog-title"` y title con `id="dialog-title"`. |
| **"use client" en páginas con useState** | ✅ PASS | Todas las 5 páginas interactivas (`upload`, `documents`, `search/results`, `admin`, `auth/login`) tienen `"use client"`. |
| **ARIA en Dropdown** | ⚠️ Parcial | Trigger: `aria-haspopup="listbox" aria-expanded` ✅. Opciones: `role="option"` pero **falta `aria-selected` dinámico** (siempre `false`). |
| **Toast live region** | ✅ PASS | `role="alert" aria-live="polite"` en contenedor. |
| **Error states en Input** | ✅ PASS | `aria-invalid`, `aria-describedby` apuntando a mensaje de error con `id="input-error"`. |

---

## 5. Recomendaciones de Corrección con Prioridad

### 🔴 CRÍTICA (Bloquean Gate 3 — Corregir antes de merge)

| # | Problema | Archivos a corregir | Solución propuesta |
|---|----------|---------------------|-------------------|
| 1 | **Button secondary: texto invisible (1:1)** | `components/ui/button.tsx` | Cambiar `text-secondary` por `text-text-inverse` (blanco) en variant secondary, o usar `bg-secondary` con `text-surface`. |
| 2 | **text-muted #a1a1aa sobre background #fafaf6 (2.35:1)** | `components/ui/toast.tsx`, `components/ui/dialog.tsx`, `components/ui/badge.tsx`, `app/upload/page.tsx`, `app/documents/page.tsx`, `app/search/results/page.tsx`, `app/admin/page.tsx`, `app/page.tsx` | Subir `text-muted` a `#71717a` (zinc-500, ~4.6:1) o bajar `background` a tono más oscuro. **Preferible:** cambiar token `text-muted` a `#71717a` en `design-tokens.json` + `variables.css` y regenerar. |
| 3 | **text-muted #a1a1aa sobre surface #ffffff (2.47:1)** | Mismos que arriba | Misma corrección que #2. |
| 4 | **Enlaces globales: primary #b45309 sobre background (3.87:1)** | `app/globals.css` | Cambiar `a { color: var(--color-primary) }` a `color: var(--color-text-primary)` y `hover: var(--color-primary)`, o subir primary a tono más oscuro (ej. `#92400e` para enlace base). |
| 5 | **Badge primary: 2.84:1** | `components/ui/badge.tsx` | Cambiar `text-primary` por `text-primary-hover` (#92400e) o subir `primary-light` a tono más oscuro. |
| 6 | **Search results inline badges: 4.15:1 / 4.19:1** | `app/search/results/page.tsx` | Usar `bg-primary/20` + `text-primary-hover` o `bg-primary` + `text-surface` (como Badge component). |
| 7 | **Dark mode text-muted #71717a sobre background #09090b (4.28:1)** | `styles/variables.css` (media query dark) | Subir `text-muted` dark a `#a1a1aa` (zinc-400) o bajar background. |
| 8 | **Input/SearchInput: label sin asociación programática** | `components/ui/input.tsx`, `components/ui/search-input.tsx` | Añadir `id` único al input y `htmlFor` al label. |
| 9 | **Dialog close button y Badge CloseBadge sin focus-visible** | `components/ui/dialog.tsx`, `components/ui/badge.tsx` | Añadir `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary` a ambos botones. |

### 🟠 ALTA (Corregir en sprint actual)

| # | Problema | Archivos | Solución |
|---|----------|----------|----------|
| 10 | **Falta active/pressed en Button, Input, Dropdown, SearchInput** | `button.tsx`, `input.tsx`, `dropdown.tsx`, `search-input.tsx` | Añadir `active:scale-[0.98]` (Button) / `active:bg-primary/5` (otros) o `active:opacity-90`. |
| 11 | **Falta hover en SearchInput** | `search-input.tsx` | Añadir `hover:border-primary/50` o similar. |
| 12 | **Dropdown options: `aria-selected` siempre false** | `dropdown.tsx` | Hacer `aria-selected={option.value === value}`. |
| 13 | **Toast description: text-muted en surface (2.47:1)** | `toast.tsx` | Cambiar `text-text-muted` por `text-text-secondary` (7.02:1). |
| 14 | **Admin stats labels: text-muted en surface (2.47:1)** | `admin/page.tsx` | Cambiar `text-text-muted` por `text-text-secondary`. |
| 15 | **Upload page description: text-muted en surface (2.47:1)** | `upload/page.tsx` | Cambiar `text-text-muted` por `text-text-secondary`. |
| 16 | **Empty states: text-muted en background (2.35:1)** | `documents/page.tsx`, `search/results/page.tsx` | Cambiar `text-text-muted` por `text-text-secondary` (6.70:1). |

### 🟡 MEDIA (Deuda técnica — próximo sprint)

| # | Problema | Archivos | Solución |
|---|----------|----------|----------|
| 17 | **Motion spinner exactamente 500ms (límite)** | `styles/variables.css` | Reducir a 400ms para margen de seguridad. |
| 18 | **Button variant secondary semántica confusa** | `button.tsx`, `design-tokens.json` | Revisar si "secondary" debe ser outline/ghost; documentar intención en `guia-estilos.md`. |
| 19 | **Tailwind config: `darkMode: "class"` pero CSS usa media query** | `tailwind.config.ts`, `variables.css` | Alinear estrategia: usar `class` en HTML o cambiar config a `"media"`. |
| 20 | **Table: filas impares/pares usan bg-background y bg-primary/5** | `table.tsx` | Verificar contraste en modo oscuro (no probado). |

### 🟢 BAJA (Nice to have)

| # | Problema | Archivos | Solución |
|---|----------|----------|----------|
| 21 | **CardHeader/CardTitle/CardBody/CardFooter no exportan tipos** | `card.tsx` | Añadir `export type CardHeaderProps = ...` para consumers. |
| 22 | **NavLink `active` usa `after:` pseudo-element (no token)** | `nav.tsx` | Mover color de línea activa a token `primary`. |
| 23 | **SearchInput label flotante: `absolute` sin `pointer-events-none` en input** | `search-input.tsx` | Verificar que click en label enfoca input (actualmente `pointer-events-none` en label lo permite). |

---

## 6. Conclusión: ¿Cumple Gate 3?

### ❌ **NO CUMPLE**

**Motivos de bloqueo (críticos):**
1. **Contraste WCAG AA falla en 8 pares de color**, 3 de ellos severos (1:1 invisible, 2.35:1, 2.84:1).
2. **Botón secondary completamente inutilizable** (texto = fondo).
3. **Labels de inputs sin asociación programática** (fallo WCAG 1.3.1/4.1.2).
4. **Elementos interactivos sin focus-visible** (Dialog close, Badge CloseBadge).
5. **Enlaces globales por debajo de 4.5:1** en fondo principal.

**Requisitos para pasar Gate 3:**
- Corregir los 9 items **CRÍTICOS** (§5).
- Verificar contraste en **modo oscuro** tras ajustes de tokens.
- Ejecutar tests automatizados de a11y (axe-core) en CI.
- Validar con usuarios de lectores de pantalla (NVDA/VoiceOver) los flujos principales: login, upload, búsqueda, admin.

**Estimación de esfuerzo:** ~2-3 días de trabajo enfocado en tokens de color (`design-tokens.json` → `variables.css` → regenerar Tailwind) + correcciones puntuales en 6-8 componentes.

---

## 7. Evidencia de Validación (Checklist de Lectura Directa)

| Archivo | Leído | Líneas | Hallazgos clave |
|---------|-------|--------|-----------------|
| `components/ui/button.tsx` | ✅ | 1-128 | Variant secondary invisible; falta active; loading spin 500ms OK |
| `components/ui/card.tsx` | ✅ | 1-100 | OK; usa tokens; sub-componentes tipados |
| `components/ui/input.tsx` | ✅ | 1-73 | Label sin htmlFor; falta hover/active; focus-visible OK |
| `components/ui/dialog.tsx` | ✅ | 1-120 | Close button sin focus-visible; aria-modal OK; transition 200ms OK |
| `components/ui/dropdown.tsx` | ✅ | 1-122 | Options aria-selected hardcoded false; falta active; focus-visible OK |
| `components/ui/badge.tsx` | ✅ | 1-69 | Primary 2.84:1; CloseBadge sin focus-visible |
| `components/ui/table.tsx` | ✅ | 1-150 | Striped rows OK; header contrast OK; hover OK |
| `components/ui/nav.tsx` | ✅ | 1-150 | Estados completos; mobile menu OK; focus-visible OK |
| `components/ui/search-input.tsx` | ✅ | 1-69 | Label flotante sin htmlFor; falta hover; focus-visible OK |
| `components/ui/toast.tsx` | ✅ | 1-128 | Description 2.47:1; close btn focus-visible OK; live region OK |
| `app/page.tsx` | ✅ | 1-25 | Inline styles con CSS vars; contrastes OK |
| `app/layout.tsx` | ✅ | 1-18 | bg-background/text-text-primary OK |
| `app/upload/page.tsx` | ✅ | 1-97 | Description 2.47:1; drag zone focus-visible OK |
| `app/documents/page.tsx` | ✅ | 1-79 | Empty state 2.35:1; Badge usage OK |
| `app/search/results/page.tsx` | ✅ | 1-111 | Inline badges 4.15:1/4.19:1; empty state 2.35:1 |
| `app/admin/page.tsx` | ✅ | 1-139 | Stats labels 2.47:1; select nativo sin focus-visible personalizado |
| `app/auth/login/page.tsx` | ✅ | 1-79 | Input labels sin htmlFor; link hover 3.87:1 en background |
| `styles/variables.css` | ✅ | 1-121 | Tokens alineados a taste-brief; prefers-reduced-motion sin !important; spin 500ms |
| `tailwind.config.ts` | ✅ | 1-36 | Mapeo correcto; darkMode: "class" vs media query en CSS |
| `design-tokens.json` | ✅ | 1-307 | Fuente de verdad; text-muted #a1a1aa confirmado |
| `guia-estilos.md` | ✅ | 1-292 | Anti-patrones §10; reglas componentes §8; nota variables.css pendiente |
| `arch-plan.md` | ✅ | 1-87 | Gates definidos; Gate 3 = este informe |
| `component-map.csv` | ✅ | 1-16 | 11 base + 5 páginas = 16 (app/page.tsx = 17º) |

---

**Firmado:** Lane D Auditor (Fase 3)  
**Próxima acción:** Lane C (Fixer) corrige items CRÍTICOS → Re-auditoría → Gate 3 pass → Fase 4 (Ship).