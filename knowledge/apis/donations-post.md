---
type: API Endpoint
title: POST /api/donations
description: Registra una donación en pending; el checkout de tarjeta o PayPal es un POST aparte.
resource: /api/donations
tags: [api, donations]
timestamp: 2026-09-09T00:00:00Z
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
| `method` | string | `spei` (default), `card` o `paypal` |
| `consent` | boolean | **requerido y en `true`**; consentimiento expreso para datos sensibles |
| `wantsReceipt` | boolean | si `true`, exige sesión y texto CFDI 4.0 |

# Respuesta

`{ donation, checkoutUrl, uma? }`. `checkoutUrl` queda `null`; el cliente inicia el cobro con `POST /api/payments/checkout`. `uma` es el acumulado de 6 meses y la clasificación si hay sesión.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos, monto fuera de rango, campaña inexistente o método inválido |
| 401 | `wantsReceipt` sin sesión |
| 403 | Cuenta de administrador (el personal no dona) |
| 422 | No se aceptó el aviso de privacidad (`consent` distinto de `true`) |
| 429 | Más de 20 donaciones por IP en 5 minutos |
| 503 | El método de pasarela no está habilitado o faltan credenciales |

# Notas

- El monto se redondea a centavos y se guarda como `NUMERIC(12,2)`; nunca como punto flotante crudo.
- Sin sesión, `user_id` queda nulo: la donación se registra pero no aparece en ningún historial.
- El consentimiento se exige también sin sesión, porque el donativo revela creencias religiosas.
  Tras crear la donación se escriben en `consents` las filas `privacy_notice` y `sensitive_data`,
  ligadas por `donation_id` cuando no hay usuario. Ver
  [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md).
- El orden de validación es: campos, monto, campaña, consentimiento. Un `422` implica que el resto
  del cuerpo ya era válido.
- El estado `paid` no se asigna en este POST.
- Tras crear la donación con método `card` o `paypal`, el cliente llama `POST /api/payments/checkout` y redirige al proveedor; el webhook (o captura PayPal) marca `paid`/`failed`. SPEI CLABE sigue siendo manual. Ver [/apis/payments-checkout.md](/apis/payments-checkout.md).
- PayPal y Mercado Pago reciben solo monto, MXN y el uuid de la donación.
- Límites de monto: [/data/field-limits.md](/data/field-limits.md).
