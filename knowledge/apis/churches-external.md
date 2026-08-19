---
type: Integration
title: Iglesias API Odoo (IURD)
description: Endpoint externo de iglesias en miembros.iurdsys.net; Nitro lo consulta con API key y caché.
resource: https://miembros.iurdsys.net/api/churches
tags: [api, churches, odoo, integration]
timestamp: 2026-08-19T00:00:00Z
---

# Contrato

- **URL base:** `runtimeConfig.churchesApiUrl` (default `https://miembros.iurdsys.net/api/churches`)
- **Auth:** header `X-API-Key` con `NUXT_CHURCHES_API_KEY` (solo servidor; opcional mientras Odoo no la exija)
- **Consumidor:** `server/utils/churches.ts` vía `GET /api/churches`
- **Host permitido:** `NUXT_CHURCHES_API_ALLOWED_HOST` (default `miembros.iurdsys.net`)

# Query hacia Odoo

| Campo | Tipo | Notas |
|-------|------|--------|
| `latitude` | number | Nitro reenvía coords saneadas (-90…90) |
| `longitude` | number | Nitro reenvía coords saneadas (-180…180) |

# Respuesta Odoo

```json
{
  "results": [
    {
      "id": 6,
      "distance": 1.36,
      "latitude": 19.39492,
      "longitude": -99.13818,
      "name": "ALAMOS-BENITO JUAREZ",
      "alias": "ALAMOS",
      "reference": "Frente al metro Xola",
      "address": "Calz. de Tlalpan 663, ...",
      "image_url": "https://miembros.iurdsys.net/...",
      "google_url": "https://maps.google.com/...",
      "click_2_call": "https://iurd.3cx.run/...",
      "schedules": { "monday": ["07:30 AM", "..."] }
    }
  ]
}
```

Odoo devuelve el catálogo completo (~253 templos) ordenado por distancia. `pagination` puede ser
`null`. Nitro mapea cada ítem con `utils/mapChurch.ts`.

# Seguridad en Nitro

| Control | Detalle |
|---------|---------|
| Proxy obligatorio | El navegador nunca llama a Odoo (CORS + ocultar API key) |
| HTTPS + host allowlist | Rechaza URLs no HTTPS o con host distinto al permitido |
| API key server-side | `churchesApiKey` no está en `runtimeConfig.public` |
| Sin redirects | `$fetch` con `redirect: 'error'` |
| Timeout | 8 s |
| Validación de respuesta | Máx. 1000 ítems; cada uno exige `id` numérico y `name` |
| Caché en memoria | Por coords redondeadas (2 decimales), TTL `NUXT_CHURCHES_CACHE_TTL_MS` (default 1 h) |
| Rate limit | 60 GET `/api/churches` por IP cada 5 min |
| Logs | Errores sin volcar direcciones ni la key |

# Si Odoo cae

`listChurches` sirve `server/data/churches.json` con `source: sample`. El directorio `/iglesias`
muestra aviso y deja continuar la donación.

Contrato Nitro: [/apis/churches-get.md](/apis/churches-get.md).

# Histórico

Antes se consumía WordPress (`/wp-json/iurd/v1/churches`), que a su vez proxyeaba Odoo. WordPress
se da de baja; ver [/decisions/churches-odoo-direct.md](/decisions/churches-odoo-direct.md).
