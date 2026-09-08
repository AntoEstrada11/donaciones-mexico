---
type: API Endpoint
title: POST /api/payments/checkout
description: Inicia cobro alojado para una donación pending (MercadoPago o PayPal).
resource: /api/payments/checkout
tags: [api, payments]
status: implemented
timestamp: 2026-09-07T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** sesión opcional; si la donación tiene `user_id`, debe coincidir con la sesión.
- **Body:** `{ donationId }` (uuid).
- **Comportamiento:** lee monto y método de la fila `donations` (nunca del cliente); enruta al adaptador activo; persiste `provider` + `providerReference`; responde `{ redirectUrl }`.
- **Implementación:** `server/api/payments/checkout.post.ts` + `server/payments/`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Donación inexistente o no `pending`; método SPEI |
| 403 | Donación de otro usuario |
| 503 | Credenciales del modo activo ausentes / método deshabilitado |
| 429 | Límite de tasa por IP |

# Relacionado

[/apis/payments-webhook.md](/apis/payments-webhook.md) · [/apis/donations-post.md](/apis/donations-post.md)
