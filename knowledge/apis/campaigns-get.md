---
type: API Endpoint
title: GET /api/campaigns
description: Lista las campañas activas desde PostgreSQL, ordenadas por sort_order.
resource: /api/campaigns
tags: [api, campaigns]
timestamp: 2026-08-06T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** ninguna
- **Handler:** `server/api/campaigns.get.ts`
- **Repositorio:** `listCampaigns()` en `server/utils/donations.ts`
- **Fuente:** tabla `campaigns` (sembrada desde `server/data/campaigns.json`)

# Respuesta

Array de `Campaign`: `id` (uuid), `name`, `slug`, `description`, `type`.

Solo devuelve filas con `active = true`.

# Notas

Los identificadores son uuid generados en la base; el `slug` es la llave estable para sembrar y referenciar desde código.
