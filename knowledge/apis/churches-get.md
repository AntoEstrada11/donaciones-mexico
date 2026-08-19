---
type: API Endpoint
title: GET /api/churches
description: Directorio de iglesias. Proxy a Odoo IURD; si falla, muestra el JSON de ejemplo.
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

En la UI (`/iglesias`) las coordenadas del dispositivo **solo** se envían si el usuario pulsa
«Usar mi ubicación». Sin permiso se usan los defaults; la búsqueda por texto no sale del navegador.
Las coords se reenvían a Odoo (`miembros.iurdsys.net`) para ordenar por cercanía; no se guardan en
la cuenta del donante. Ver [/data/personal-data-inventory.md](/data/personal-data-inventory.md).

# Respuesta

```json
{
  "churches": [{ "id": "...", "name": "...", "city": "...", "state": "...", "address": "..." }],
  "source": "odoo"
}
```

`source` es `odoo` o `sample`. Con `sample` el UI avisa que el catálogo oficial no está disponible.

# Seguridad

Nitro valida HTTPS, host allowlist, timeout, tamaño de respuesta y rate limit. La API key solo vive
en servidor. Detalle: [/apis/churches-external.md](/apis/churches-external.md).

# Fallback

Si Odoo no responde JSON válido, se lee `server/data/churches.json`. Ver [/data/churches-json.md](/data/churches-json.md).

URL remota: `NUXT_CHURCHES_API_URL`. Key: `NUXT_CHURCHES_API_KEY`.
