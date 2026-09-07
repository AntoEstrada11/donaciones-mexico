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
| `method` | string | `spei` (default), `card` o (previsto) `paypal` |
| `consent` | boolean | **requerido y en `true`**; consentimiento expreso para datos sensibles |

# Respuesta

`Donation` con `id` uuid, `currency: MXN` y `status: pending`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos, monto fuera de rango o campaña inexistente |
| 422 | No se aceptó el aviso de privacidad (`consent` distinto de `true`) |
| 429 | Más de 20 donaciones por IP en 5 minutos |

# Notas

- El monto se redondea a centavos y se guarda como `NUMERIC(12,2)`; nunca como punto flotante crudo.
- Sin sesión, `user_id` queda nulo: la donación se registra pero no aparece en ningún historial.
- El consentimiento se exige también sin sesión, porque el donativo revela creencias religiosas.
  Tras crear la donación se escriben en `consents` las filas `privacy_notice` y `sensitive_data`,
  ligadas por `donation_id` cuando no hay usuario. Ver
  [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md).
- El orden de validación es: campos, monto, campaña, consentimiento. Un `422` implica que el resto
  del cuerpo ya era válido.
- Hoy no hay cobro real; el estado `pending` no cambia hasta pasarela o conciliación SPEI manual.
- **Diseño aceptado (código pendiente):** tras crear la donación, `POST /api/payments/checkout` redirige a MercadoPago o PayPal; el webhook marca `paid`/`failed`. SPEI CLABE sigue siendo manual. Ver [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md) y [/apis/payments-checkout.md](/apis/payments-checkout.md).
- Límites de monto: [/data/field-limits.md](/data/field-limits.md).
