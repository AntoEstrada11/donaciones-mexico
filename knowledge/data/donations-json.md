---
type: Data File
title: Donaciones mock
description: JSON estático de donaciones de ejemplo para historial.
resource: server/data/donations.json
tags: [data, donations]
timestamp: 2026-07-20T00:00:00Z
---

# Ubicación

- Path en repo: `server/data/donations.json`
- Servido por: `GET /api/donations`

# Formato

Array de `Donation`: `id`, `churchId`, `campaignId`, `amount`, `currency`, `status`, `method`, `createdAt`.

Estados: `paid` | `pending` | `failed` | `cancelled`.

# Operación

`POST /api/donations` no escribe este archivo. Persistencia real queda pendiente.
