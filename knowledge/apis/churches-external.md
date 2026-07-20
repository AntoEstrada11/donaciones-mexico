---
type: Integration
title: Iglesias API WordPress (IURD MX)
description: Endpoint externo de iglesias consumido por el front (no Nitro).
resource: https://universal.org.mx/wp-json/iurd/v1/churches
tags: [api, churches, wordpress]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **URL base:** `runtimeConfig.public.churchesApiUrl` (default en `nuxt.config.ts`)
- **Consumidor:** `composables/useChurches.ts`
- **Auth:** pública (sin Bearer de la app)

# Uso

Query por latitud/longitud (defaults CDMX en config pública). La respuesta se mapea a `Church` (`types/index.ts`).

# Tipos

Ver `ChurchesApiResponse` / `ChurchApiItem` en `types/index.ts`.

# Fallback

Existe `server/data/churches.json` como datos de muestra; el directorio `/iglesias` usa la API externa vía el composable.
