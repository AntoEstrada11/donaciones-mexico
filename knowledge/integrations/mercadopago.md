---
type: Integration
title: MercadoPago
description: Proveedor principal de cobro en v1 (Checkout Pro, webhooks firmados).
tags: [integration, payments, mercadopago]
status: implemented
timestamp: 2026-09-07T00:00:00Z
---

# Rol

Proveedor **principal** de tarjeta en México (v1). Donación única vía Preference (Checkout Pro). Recurrente (`/preapproval`) queda en fase 2.

# Flujo v1

1. `POST /api/donations` crea la donación `pending` (consentimiento como hoy).
2. `POST /api/payments/checkout` crea Preference (`external_reference = donation.id`, monto desde BD). `notification_url` usa `NUXT_PAYMENT_WEBHOOK_BASE_URL` (o site URL). `back_urls` usan HTTPS (en local: túnel) para permitir `auto_return`.
3. Redirect a `init_point` / `sandbox_init_point`.
4. Webhook firmado y/o `POST /api/payments/mercadopago/sync` al volver a `/donaciones/gracias` con `payment_id`.

Código: `server/payments/mercadopago.ts`. Dev: `vite.server.allowedHosts` debe incluir el dominio del túnel o Vite responde **403**.

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
