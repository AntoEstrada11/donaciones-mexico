---
type: API Endpoint
title: POST /api/donations
description: Registra una donación en estado pending en PostgreSQL.
resource: /api/donations
tags: [api, donations]
timestamp: 2026-08-07T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** opcional (`optionalSession`); con token la donación queda asociada al donante
- **Handler:** `server/api/donations.post.ts`
- **Repositorio:** `createDonation()` en `server/utils/donations.ts`
- **Validación:** monto vía `utils/fieldLimits.ts`

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `churchId` | string | requerido; id externo de la API de iglesias (máx. 64) |
| `campaignId` | string (uuid) | requerido; debe existir en `campaigns` |
| `amount` | number | requerido; entre $1 y $999,999.99 MXN |
| `method` | string | `card` o default `spei` |

# Respuesta

`Donation` con `id` uuid, `currency: MXN` y `status: pending`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos, monto fuera de rango o campaña inexistente |

# Notas

- El monto se redondea a centavos y se guarda como `NUMERIC(12,2)`; nunca como punto flotante crudo.
- Sin sesión, `user_id` queda nulo: la donación se registra pero no aparece en ningún historial.
- No hay cobro real; el estado `pending` no cambia hasta que exista pasarela o conciliación SPEI.
- Límites de monto: [/data/field-limits.md](/data/field-limits.md).
