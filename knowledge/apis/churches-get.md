---
type: API Endpoint
title: GET /api/churches
description: Directorio de iglesias. Proxy a WordPress IURD; si falla, muestra el JSON de ejemplo.
resource: /api/churches
tags: [api, churches]
timestamp: 2026-08-18T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** ninguna
- **Handler:** `server/api/churches.get.ts`
- **Repositorio:** `listChurches()` en `server/utils/churches.ts`

# Query

| Campo | Tipo | Notas |
|-------|------|--------|
| `latitude` | number | opcional; default CDMX (`runtimeConfig.public.defaultLatitude`) |
| `longitude` | number | opcional; default CDMX |

# Respuesta

```json
{
  "churches": [{ "id": "...", "name": "...", "city": "...", "state": "...", "address": "..." }],
  "source": "wordpress"
}
```

`source` es `wordpress` o `sample`. Con `sample` el UI avisa que el catálogo oficial no está disponible.

# Fallback

Si `https://universal.org.mx/wp-json/iurd/v1/churches` no responde JSON válido (p. ej. HTTP 500), se lee `server/data/churches.json`. Ver [/data/churches-json.md](/data/churches-json.md).

URL remota: `runtimeConfig.churchesApiUrl` / `NUXT_CHURCHES_API_URL`.
