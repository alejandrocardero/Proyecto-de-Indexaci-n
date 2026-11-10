# Contrato de integración frontend ↔ backend

## Hallazgos sobre `main`

El frontend existente contiene páginas y componentes visuales para inicio, login, documentos, subida, resultados de búsqueda y administración. En el commit revisado, los handlers son simulados: login solo valida campos, documentos/admin usan arrays locales, búsqueda usa `setTimeout` y subida/chat también simulan el flujo. El `package.json` no incluye `@supabase/supabase-js`.

## Mapeo de pantallas

| Pantalla | Integración propuesta |
|---|---|
| `/auth/login` | Supabase Auth `signInWithPassword`; después consultar `/auth/me` |
| `/documents` | `GET /documents`; `status` filtra `review_status` |
| `/upload` | `POST /documents` multipart; consultar detalle/listado para estado |
| `/search/results` | `POST /search` con `query` y filtros |
| `/admin` | `GET /documents?status=pending`; `PATCH /documents/{id}/review`; `GET /audit` |

## Cabeceras

- `Authorization: Bearer <Supabase access_token>`
- `X-Organization-Id: <organization UUID>` en rutas de tenant.

## Búsqueda

Solicitud:
```json
{
  "query": "plazo para presentar declaración",
  "filters": {"status": "approved", "date_range": "this-month"},
  "limit": 10,
  "offset": 0
}
```

La forma final de los resultados y las citas se cerrará cuando Nelson entregue las propiedades de Weaviate y el formato de chunk/citation.

## Decisiones pendientes

- Confirmar si el flujo de revisión `pending/approved/rejected` es realmente necesario o solo una maqueta de UI.
- Confirmar filtros exactos y paginación de la pantalla de búsqueda.
- Definir el contrato de citas (documento, página, fragmento, score).
- Definir eventos de indexación y cómo se actualiza `indexing_status`.
- Conectar chat RAG solo si se decide incluirlo en el MVP; el plan original lo deja fuera de alcance.
