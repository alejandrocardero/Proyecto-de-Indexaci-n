# Backend FastAPI — MiPymes

API de aplicación para la plataforma de indexación multimodal. Se incorpora como carpeta independiente `backend/` dentro del monorepo Next.js.

## Requisitos

- Python 3.11 o 3.12 recomendado.
- Proyecto Supabase con Auth, PostgreSQL y Storage.
- Bucket privado `documents`.
- Variables de entorno copiadas desde `.env.example`.

## Ejecutar localmente

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\\Scripts\\Activate.ps1
# Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Documentación OpenAPI: `http://localhost:8000/docs`.

## Contrato principal

Todas las rutas se encuentran bajo `/api/v1`.

| Método | Ruta | Función |
|---|---|---|
| GET | `/health` | Estado del servicio |
| GET | `/auth/me` | Usuario autenticado |
| GET | `/organizations` | Organizaciones del usuario |
| GET | `/documents` | Listar documentos del tenant |
| POST | `/documents` | Subir archivo multipart |
| GET | `/documents/{id}` | Obtener documento |
| PATCH | `/documents/{id}/review` | Aprobar/rechazar |
| DELETE | `/documents/{id}` | Archivado lógico |
| GET | `/organizations/{id}/members` | Listar miembros |
| PATCH | `/organizations/{id}/members/{user_id}` | Cambiar rol |
| GET | `/audit` | Eventos de auditoría |
| POST | `/search` | Contrato de búsqueda, pendiente Weaviate |

Las rutas protegidas requieren `Authorization: Bearer <access_token>` emitido por Supabase. Las rutas que operan sobre un tenant requieren además `X-Organization-Id: <uuid>`.

## Estados separados

- `review_status`: `pending`, `approved`, `rejected` (panel administrativo).
- `indexing_status`: `queued`, `processing`, `indexed`, `error` (estado del pipeline).

No deben mezclarse ambos estados en el frontend. La subida crea el documento con revisión `pending` e indexación `queued`.

## Integración con el frontend de Marcos

El frontend actual tiene pantallas `/auth/login`, `/documents`, `/upload`, `/search/results` y `/admin`. Sus interacciones todavía usan datos locales, `setTimeout` y respuestas simuladas. Para conectarlo:

1. Instalar `@supabase/supabase-js` en Next.js y configurar el cliente con la anon key.
2. Login/signup mediante Supabase Auth; no enviar contraseñas a FastAPI.
3. En cada llamada protegida, enviar el access token como Bearer.
4. Al elegir organización, enviar `X-Organization-Id`.
5. En `/upload`, usar `FormData` con campo `file` y opcional `title`.
6. Mostrar `indexing_status` en la pantalla de subida y `review_status` en administración.
7. Adaptar búsqueda a `POST /api/v1/search`; hoy devuelve 503 controlado hasta que Nelson entregue el esquema de Weaviate.

### Ejemplo de subida

```ts
const form = new FormData();
form.append("file", file);
form.append("title", file.name);

const response = await fetch(`${API_URL}/api/v1/documents`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${session.access_token}`,
    "X-Organization-Id": organizationId,
  },
  body: form,
});
```

## Seguridad y decisiones

- El `service_role` solo existe en el servidor; nunca en Next.js/browser.
- La API verifica JWT y valida membresía en cada petición multi-tenant.
- El acceso de usuarios se limita por `organization_id`.
- El archivado es lógico; no elimina físicamente el objeto Storage.
- La política de roles: `admin`, `manager`, `staff`, `viewer`.
- El SQL es una base inicial; debe revisarse con Lázaro antes de producción.
- No hay todavía worker de indexación, extracción OCR, chunking ni búsqueda real.
- Configurar límites de tasa, antivirus/validación de contenido y URLs firmadas antes de producción.
