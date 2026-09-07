---
type: Integration
title: MercadoPago
description: Proveedor principal de cobro en v1 (Checkout Pro, webhooks firmados).
tags: [integration, payments, mercadopago]
status: planned
timestamp: 2026-09-07T00:00:00Z
---

# Rol

Proveedor **principal** de tarjeta en México (v1). Donación única vía Preference (Checkout Pro). Recurrente (`/preapproval`) queda en fase 2.

# Flujo v1

1. `POST /api/donations` crea la donación `pending` (consentimiento como hoy).
2. `POST /api/payments/checkout` crea Preference con `external_reference = donation.id`, monto desde BD, `notification_url` y `back_urls` → `/donaciones/gracias`.
3. Redirect a `init_point`.
4. Webhook `POST /api/payments/webhook/mercadopago`: verificar `x-signature` (HMAC-SHA256, manifest `id:;request-id:;ts:;`, `timingSafeEqual`), responder 200, luego `GET /v1/payments/{id}` para el estado real.

# Credenciales (solo env)

| Variable | Uso |
|----------|-----|
| `NUXT_MP_ACCESS_TOKEN_TEST` / `_LIVE` | API |
| `NUXT_MP_WEBHOOK_SECRET_TEST` / `_LIVE` | Firma del webhook |

El modo activo lo elige admin en `payment_settings.mode`. Nunca en `runtimeConfig.public` ni en logs.

# Mapa de estados (orientativo)

| MP | Interno |
|----|---------|
| `approved` | `paid` |
| `rejected` / `cancelled` | `failed` / `cancelled` |
| `refunded` / `charged_back` | `refunded` |
| resto | `pending` |

# Seguridad

- Raw body antes de parsear. Idempotencia en `payment_events` por `(mercadopago, providerEventId)`.
- No limitar el webhook por IP; proteger con firma + idempotencia.
- No persistir el body completo del webhook (PII del pagador).

# Relacionado

[/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md) · [/decisions/checkout-hospedado-pci.md](/decisions/checkout-hospedado-pci.md) · [/integrations/paypal.md](/integrations/paypal.md)
