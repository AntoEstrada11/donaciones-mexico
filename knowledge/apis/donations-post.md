---
type: API Endpoint
title: POST /api/donations
description: Crea una donación pending en memoria (no escribe donations.json).
resource: /api/donations
tags: [api, donations]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** ninguna (hoy)
- **Handler:** `server/api/donations.post.ts`

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `churchId` | string | requerido |
| `campaignId` | string | requerido |
| `amount` | number | requerido, > 0 |
| `method` | string | `card` o default `spei` |

# Respuesta

`Donation` con `id` generado, `currency: MXN`, `status: pending`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos o monto inválido |

# Limitación

La respuesta no se persiste en `server/data/donations.json`; un GET posterior no incluirá esta donación.
