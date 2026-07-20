---
type: API Endpoint
title: GET /api/campaigns
description: Lista campañas mock (diezmo, ofrenda, obra social, propósito de fe).
resource: /api/campaigns
tags: [api, campaigns]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** ninguna
- **Handler:** `server/api/campaigns.get.ts`
- **Fuente:** `server/data/campaigns.json`

# Respuesta

Array de `Campaign`: `id`, `name`, `slug`, `description`, `type`.
