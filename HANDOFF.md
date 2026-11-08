# Handoff - MiPymes Frontend

## Stack y Versión

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Framework** | Next.js 15 | 15.0.0 |
| **Lenguaje** | TypeScript | ^5.6 |
| **Estilizado** | Tailwind CSS | 3.4.13 |
| **Componentes** | Componentes UI propios | - |
| **Utilidades** | clsx, tailwind-merge | ^2.1.1, ^2.5.0 |
| **Runtime** | React | 19.0.0 |
| **Despliegue** | Next.js static export / Node.js | - |

## Estructura de Carpetas y Convención Write Scope

```
frontend/
├── app/                    # Rutas Next.js 15 (app router)
│   ├── page.tsx           # Home /
│   ├── layout.tsx         # Layout raíz
│   ├── admin/page.tsx     # Panel administración
│   ├── upload/page.tsx    # Subida de documentos
│   ├── documents/page.tsx # Gestión de documentos
│   ├── search/results/page.tsx # Resultados búsqueda
│   └── auth/              # Auth (login)
├── components/
│   └── ui/                # 11 componentes base
│       ├── button.tsx
│       ├── badge.tsx
│       ├── close-badge.tsx (exportado desde badge.tsx)
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── dropdown.tsx
│       ├── search-input.tsx
│       ├── table.tsx
│       ├── nav.tsx
│       ├── toast.tsx
│       └── card.tsx
├── styles/
│   └── variables.css      # Fuente de verdad: tokens CSS custom properties
├── tailwind.config.ts     # Mapeo Tailwind → var(--color-*)
├── lib/
│   └── utils.ts          # helper cn() (tailwind-merge + clsx)
├── package.json
└── tsconfig.json
```

**Convención write scope:** Cuando se solicite crear o modificar archivos, **solo** los archivos incluidos en el write scope deben tocarse. El write scope define los "archivos de verdad" sincronizados con el diseño y el sistema de tokens. Cualquier cambio fuera de este conjunto debe ser aprobado por el orquestador.

## Jerarquía de Fuentes de Verdad

1. **`design-tokens.json`** - Definición original de colores, tipografía, espaciado, sombras, motion (no está en el repo; fue la fuente original)
2. **`styles/variables.css`** - Generado a partir de `design-tokens.json`, contiene `var(--nombre-token)` como valores CSS custom properties
3. **`tailwind.config.ts`** - Mapeo de nombres Tailwind a `var(--color-*)` (ej. `primary: "var(--color-primary)"`)
4. **`guia-estilos.md`** - Reglas de oro, anti-patrones, convenciones de componentes
5. **`component-map.csv` - Mapa de 11 componentes base + 5 páginas = 16 archivos totales

**Nunca** modificar `variables.css` o `tailwind.config.ts` directamente sin actualizar la fuente de verdad correspondiente.

## Cómo Usar Tokens (Clases Tailwind Mapeadas a `var(--color-*)`)

### Mapeo de colores

| Clase Tailwind | Variable CSS | Uso típico |
|----------------|--------------|------------|
| `bg-primary` | `var(--color-primary)` | Fondos primarios |
| `text-primary` | `var(--color-text-primary)` | Texto principal (#18181b) |
| `text-secondary` | `var(--color-text-secondary)` | Texto secundario (#52525b) |
| `text-muted` | `var(--color-text-muted)` | Placeholders, empty states (#71717a) |
| `text-inverse` | `var(--color-text-inverse)` | Texto sobre fondos oscuros (#ffffff) |
| `bg-surface` | `var(--color-surface)` | Tarjetas, inputs, fondos (#ffffff) |
| `bg-primary-hover` | `var(--color-primary-hover)` | Hover primary (#92400e) |
| `bg-secondary-hover` | `var(--color-secondary-hover)` | Hover secondary (#3f3f46) |
| `border-primary` | `var(--color-border)` | Bordes primarios |
| `success` | `var(--color-success)` | Éxito (#15803d) |
| `warning` | `var(--color-warning)` | Advertencia (#b45309) |
| `destructive` | `var(--color-destructive)` | Destructivo (#b91c1c) |

### Ejemplo de uso

```tsx
// Botón primary usando tokens
<Button variant="primary">Acción</Button>

// Input con label asociado usando tokens
<Input label="Buscar" />

// Badge con variant secondary usando tokens
<Badge variant="secondary">Secundario</Badge>

// Clase CSS personalizada con variable
<div className="color: var(--color-text-primary);">
```

### Helper `cn()`

Todos los componentes usan el helper `cn()` de `@/lib/utils` que combina `clsx` y `tailwind-merge`:

```tsx
import { cn } from "@/lib/utils";

// Combina clases Tailwind condicionalmente
cn("bg-primary hover:bg-primary-hover", condition && "bg-secondary")

// Elimina duplicados y conflictos de tailwind-merge
cn("p-2 hover:bg-primary/5", "p-2") // → "p-2 hover:bg-primary/5"
```

## Componentes Base (11) y Páginas (5) con Rutas

### Componentes Base (`components/ui/`)

| # | Componente | Exportaciones | Rutas relacionadas |
|---|------------|---------------|-------------------|
| 1 | `button.tsx` | `Button`, `buttonVariants` | `app/upload/page.tsx`, `app/admin/page.tsx`, `app/documents/page.tsx` |
| 2 | `badge.tsx` | `Badge`, `CloseBadge` | `app/documents/page.tsx`, `app/admin/page.tsx` |
| 3 | `input.tsx` | `Input` | `app/admin/page.tsx` |
| 4 | `dialog.tsx` | `Dialog`, `DialogOverlay`, `DialogContent` | - |
| 5 | `dropdown.tsx` | `Dropdown` | - |
| 6 | `search-input.tsx` | `SearchInput` | `app/search/results/page.tsx` |
| 7 | `table.tsx` | `Table`, `TableHeader`, `TableRow`, `TableCell` | `app/documents/page.tsx`, `app/admin/page.tsx`, `app/search/results/page.tsx` |
| 8 | `nav.tsx` | `Nav`, `NavLink` | `app/layout.tsx` (header) |
| 9 | `toast.tsx` | `Toast`, `useToast` | - |
| 10 | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardBody`, `CardFooter` | - |
| 11 | `utils.ts` | `cn()` | Todos los componentes |

### Páginas (`app/`) - 5 rutas principales

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Página principal / home |
| `/admin` | `app/admin/page.tsx` | Panel de administración |
| `/upload` | `app/upload/page.tsx` | Subida de documentos |
| `/documents` | `app/documents/page.tsx` | Gestión y lista de documentos |
| `/search/results` | `app/search/results/page.tsx` | Resultados de búsqueda |

**Rutas adicionales:**
- `/auth/login` - Página de login (componente externo)
- `/_not-found` - Página de error 404 (generado automáticamente por Next.js)

### Reglas de Oro Anti-Template

1. **Nunca** usar valores hex codeados en componentes - siempre `var(--color-*)` a través de Tailwind
2. **Nunca** usar `!important` - los conflictos se resuelven con especificidad o `tailwind-merge`
3. **Siempre** mobile-first - las clases base son para mobile, las variantes `sm/` `md/` `lg/` son breakpoints
4. **Siempre** usar `cn()` para clases condicionales - nunca concatenación de strings `className="..." + ...`
5. **Siempre** `prefers-reduced-motion` respetado - las variables CSS ya incluyen el media query
6. **Siempre** 2 familias tipográficas máximas - `sans` (Geist) y `display` (Playfair)
7. **Siempre** 3 niveles de título - h1, h2, h3 solo. Usar `font-sans` o `font-display` según el token
8. **Siempre** tokens sobre hardcode - colores, espaciado, radios, sombras
9. **Siempre** asociación label/htmlFor en inputs - WCAG 1.3.1 / 4.1.2
10. **Siempre** focus-visible en elementos interactivos - `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`
11. **Nunca** modificar `variables.css` sin actualizar `design-tokens.json` primero

## Endpoints que Consume el Frontend

| Endpoint | Método | Descripción | Observación |
|----------|--------|-------------|-------------|
| `/api/documents` | GET | Listar documentos del usuario | **Proxy through backend** - el frontend nunca consulta Weaviate directamente |
| `/api/documents` | POST | Subir nuevo documento | Valida tipo y tamaño, luego indexa |
| `/api/documents/:id` | GET | Obtener documento por ID | - |
| `/api/documents/:id` | PUT/PATCH | Actualizar estado (aprobar/rechazar) | - |
| `/api/search` | POST | Búsqueda semántica/texto | - |
| `/api/auth/login` | POST | Autenticación de usuario | - |
| `/api/toast` | POST | Crear notificación toast | - |

**Regla crítica:** El frontend **nunca** consulta Weaviate directamente. Todos los endpoints van a un proxy/backend que gestiona la conexión a Weaviate. Esto aísla la clave de Weaviate, permite caching, rate-limiting y transformación de respuestas.

## Próximos Pasos Post-MVP

| Prioridad | Área | Descripción |
|-----------|------|-------------|
| **Alta** | Integración Weaviate proxy | Conectar el backend proxy con la base de datos Weaviate para búsquedas reales |
| **Alta** | Autenticación completa | Implementar login/registro con JWT y protected routes |
| **Media** | Testing automatizado | Axe-core tests de a11y en CI, tests unitarios de componentes |
| **Media** | Dark mode preferido | Persistir preferencia de modo oscuro en `localStorage` |
| **BAJA** | Mejoras visuales | Animaciones sutiles, micro-interacciones, estado "skeleton" para loading |
| **BAJA** | Internacionalización | Agregar soporte es/pt/otros idiomas |
| **BAJA** | Performance optimization | Code splitting por ruta, imagen optimization, bundle analysis |

---
*Handoff realizado por Lane E (Fixer) - Sat Nov 07 2026*