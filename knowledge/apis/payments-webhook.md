---
type: API Endpoint
title: Webhooks de pasarela
description: Notificaciones firmadas de MercadoPago y PayPal hacia Nitro.
resource: /api/payments/webhook/*
tags: [api, payments, webhooks]
status: planned
timestamp: 2026-09-07T00:00:00Z
---

# Estado

**Diseño aceptado; implementación pendiente.**

# Rutas previstas

| Método | Ruta | Proveedor |
|--------|------|-----------|
| POST | `/api/payments/webhook/mercadopago` | MercadoPago |
| POST | `/api/payments/webhook/paypal` | PayPal |

# Reglas comunes

1. Leer **raw body** antes de parsear JSON.
2. Verificar firma; `401` si falla.
3. Responder `200` pronto; confirmar estado con GET a la API del proveedor.
4. Idempotencia vía `payment_events` unique `(provider, providerEventId)`.
5. **No** rate-limit por IP (los proveedores reintentan desde muchas IPs); la defensa es firma + idempotencia.
6. No guardar el body completo (PII del pagador).

Detalle por proveedor: [/integrations/mercadopago.md](/integrations/mercadopago.md), [/integrations/paypal.md](/integrations/paypal.md).
