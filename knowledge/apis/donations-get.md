---
type: API Endpoint
title: GET /api/donations
description: Devuelve el listado estático de donaciones de ejemplo.
resource: /api/donations
tags: [api, donations]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** ninguna (hoy; candidata a restringir por sesión)
- **Handler:** `server/api/donations.get.ts`
- **Fuente:** `server/data/donations.json`

# Respuesta

Array de `Donation` con estados `paid` | `pending` | `failed` | `cancelled`.
