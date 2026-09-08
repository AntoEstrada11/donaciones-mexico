---
type: API Endpoint
title: Webhooks de pasarela
description: Notificaciones firmadas de MercadoPago y PayPal hacia Nitro.
resource: /api/payments/webhook/*
tags: [api, payments, webhooks]
status: implemented
timestamp: 2026-09-07T00:00:00Z
---

# Rutas

| Método | Ruta | Proveedor |
|--------|------|-----------|
| POST | `/api/payments/webhook/mercadopago` | MercadoPago |
| POST | `/api/payments/webhook/paypal` | PayPal |

# Reglas comunes

1. Leer **raw body** antes de parsear JSON.
2. Verificar firma; `401` si falla.
3. Responder `200` tras procesar (fetch de estado + idempotencia).
4. Idempotencia vía `payment_events` unique `(provider, providerEventId)`.
5. **No** rate-limit por IP.
6. No guardar el body completo (PII del pagador).

# MercadoPago — matices

- En modo `test`, si el POST **no** trae `x-signature` (simulador del panel MP), se responde `200` `{ skipped: "unsigned-test-ping" }` sin mutar donaciones. Los webhooks reales van firmados.
- Respaldo al retorno del navegador: `POST /api/payments/mercadopago/sync` con `payment_id` / `collection_id` (página `/donaciones/gracias`).
- Checkout Pro: `auto_return` solo si la base de `back_urls` es HTTPS. En local, las `back_urls` usan `NUXT_PAYMENT_WEBHOOK_BASE_URL` (ngrok) cuando `NUXT_PUBLIC_SITE_URL` es `http://localhost…`.

También: `POST /api/payments/paypal/capture`, `GET /api/payments/methods`.

Detalle: [/integrations/mercadopago.md](/integrations/mercadopago.md), [/integrations/paypal.md](/integrations/paypal.md).
