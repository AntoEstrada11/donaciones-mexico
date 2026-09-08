---
type: Integration
title: PayPal
description: Método de cobro adicional en v1 (Orders v2 CAPTURE, webhooks RSA-SHA256).
tags: [integration, payments, paypal]
status: implemented
timestamp: 2026-09-07T00:00:00Z
---

# Rol

Método **adicional** junto a MercadoPago (v1). Donación única vía Orders API v2 (`intent: CAPTURE`). Subscriptions queda en fase 2.

# Flujo v1

1. Donación `pending` como hoy.
2. `POST /api/payments/checkout` crea Order con `custom_id = donation.id`, monto MXN desde BD; devuelve el enlace `approve`.
3. Redirect al checkout PayPal; al volver, `POST /api/payments/paypal/capture` + página `/donaciones/gracias`.
4. Webhook `POST /api/payments/webhook/paypal`: verificar firma RSA-SHA256; confirmar estado por API.

Código: `server/payments/paypal.ts`.

# Credenciales (solo env)

| Variable | Uso |
|----------|-----|
| `NUXT_PAYPAL_CLIENT_ID_TEST` / `_LIVE` | OAuth / SDK |
| `NUXT_PAYPAL_CLIENT_SECRET_TEST` / `_LIVE` | Solo servidor |
| `NUXT_PAYPAL_WEBHOOK_ID_TEST` / `_LIVE` | Verificación de firma |

# Eventos relevantes

| Evento | Interno |
|--------|---------|
| `PAYMENT.CAPTURE.COMPLETED` | `paid` |
| `PAYMENT.CAPTURE.DENIED` | `failed` |
| `PAYMENT.CAPTURE.REFUNDED` | `refunded` |

# Seguridad

Misma disciplina que MP: raw body, firma antes de procesar, fetch del recurso real, idempotencia, sin body PII en BD.

# Relacionado

[/integrations/mercadopago.md](/integrations/mercadopago.md) · [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md)
