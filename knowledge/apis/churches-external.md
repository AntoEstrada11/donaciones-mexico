---
type: Integration
title: Iglesias API WordPress (IURD MX)
description: Endpoint externo de iglesias; Nitro lo consulta y, si falla, usa el JSON de muestra.
resource: https://universal.org.mx/wp-json/iurd/v1/churches
tags: [api, churches, wordpress]
timestamp: 2026-08-18T00:00:00Z
---

# Contrato

- **URL base:** `runtimeConfig.churchesApiUrl` (default en `nuxt.config.ts`, opcional `NUXT_CHURCHES_API_URL`)
- **Consumidor:** `server/utils/churches.ts` vía `GET /api/churches`
- **Auth:** pública (sin Bearer de la app)

# Uso

Query por latitud/longitud. La respuesta WP (`results[]`) se mapea a `Church` (`utils/mapChurch.ts`).

El navegador **no** llama a WordPress: evita CORS y permite fallback.

# Tipos

Ver `ChurchesApiResponse` / `ChurchApiItem` en `types/index.ts`.

# Si WordPress cae

Todo `/wp-json/` en universal.org.mx puede devolver HTML 500. En ese caso `listChurches` sirve `server/data/churches.json` con `source: sample`. El directorio `/iglesias` muestra un aviso y deja continuar la donación.

Contrato Nitro: [/apis/churches-get.md](/apis/churches-get.md).
