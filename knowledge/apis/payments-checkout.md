---
type: API Endpoint
title: POST /api/payments/checkout
description: Inicia cobro alojado para una donación pending (MercadoPago o PayPal).
resource: /api/payments/checkout
tags: [api, payments]
status: planned
timestamp: 2026-09-07T00:00:00Z
---

# Estado

**Diseño aceptado; implementación pendiente.** Ver [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md).

# Contrato previsto

- **Método:** `POST`
- **Auth:** sesión opcional; si hay usuario, la donación debe ser suya (o anónima).
- **Body:** `{ donationId }` (uuid).
- **Comportamiento:** lee monto y método de la fila `donations` (nunca del cliente); enruta al adaptador activo; persiste `provider` + `providerReference`; responde `{ redirectUrl }`.

# Errores previstos

| Código | Causa |
|--------|--------|
| 400 | Donación inexistente o no `pending` |
| 503 | Credenciales del modo activo ausentes / método deshabilitado |
| 429 | Límite de tasa por IP |

# Relacionado

[/apis/payments-webhook.md](/apis/payments-webhook.md) · [/apis/donations-post.md](/apis/donations-post.md)
