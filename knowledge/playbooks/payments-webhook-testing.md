---
type: Playbook
title: Probar webhooks de pasarela
description: Sandbox, túnel y casos de firma/idempotencia para MercadoPago y PayPal.
tags: [playbook, payments, testing]
timestamp: 2026-09-07T00:00:00Z
---

# Objetivo

Validar que los webhooks firman, son idempotentes y actualizan `donations.status` sin confiar ciegamente en el payload.

# Preparación

1. Credenciales **test** en `.env`.
2. Túnel HTTPS (p. ej. ngrok) si el sitio es local → apuntar `notification_url` / webhook del panel.
3. Crear una donación de prueba (`pending`) y un checkout real en sandbox.

# Casos mínimos

| Caso | Esperado |
|------|----------|
| Firma inválida / ausente | `401`, sin cambio de estado |
| Pago aprobado | `paid`, fila en `payment_events` |
| Reenvío del mismo evento | Sin segundo cambio; unique `(provider, providerEventId)` |
| Monto del proveedor ≠ donación | No marcar `paid` |
| Retorno del usuario antes del webhook | Gracias muestra pendiente; luego concilia |
| Webhook antes del retorno | Estado ya `paid` al llegar a gracias |

# MercadoPago

Usar tarjetas de prueba del panel MX. Confirmar que tras el aviso se hace `GET /v1/payments/{id}` (la verdad llega después).

# PayPal

Sandbox business + personal. Preferir verificación offline con cert `*.paypal.com`. El simulador del dashboard puede no pasar postback de verificación; usar flujo real sandbox cuando se pueda.

# Relacionado

[/playbooks/payments-setup.md](/playbooks/payments-setup.md) · [/integrations/mercadopago.md](/integrations/mercadopago.md)
