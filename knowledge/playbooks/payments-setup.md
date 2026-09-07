---
type: Playbook
title: Configurar pasarelas de pago
description: Alta de apps, llaves test/live y URLs de webhook (MercadoPago y PayPal).
tags: [playbook, payments, ops]
timestamp: 2026-09-07T00:00:00Z
---

# Antes de empezar

El código de cobro aún puede estar pendiente; este playbook describe la operación acordada. Ver [/integrations/](/integrations/) y [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md).

# Variables

Copiar nombres desde `.env.example` (nunca valores reales a `knowledge/`).

- Común: `NUXT_PUBLIC_SITE_URL` (HTTPS público del sitio).
- MercadoPago: tokens y webhook secrets test/live.
- PayPal: client id/secret y webhook id test/live.

# MercadoPago

1. Crear aplicación en el panel de desarrolladores (México).
2. Obtener Access Token de prueba y de producción.
3. Configurar webhook apuntando a `{SITE_URL}/api/payments/webhook/mercadopago`.
4. Guardar el secreto de firma en `NUXT_MP_WEBHOOK_SECRET_*`.
5. En admin `/admin/personalizar/cobros`: modo `test`, proveedor de tarjeta MercadoPago, habilitar métodos con credenciales presentes.

# PayPal

1. App en Developer Dashboard (sandbox + live).
2. Client ID / Secret; crear webhook con eventos de captura/reembolso hacia `{SITE_URL}/api/payments/webhook/paypal`.
3. Guardar el Webhook ID en `NUXT_PAYPAL_WEBHOOK_ID_*`.
4. Habilitar PayPal en `payment_settings` solo si el modo activo tiene credenciales.

# Checklist de seguridad

- [ ] Secretos solo en env / secrets del host.
- [ ] HTTPS y URL pública correcta para `back_urls` y webhooks.
- [ ] Aviso de privacidad actualizado (encargados MP/PayPal) y `LEGAL.noticeVersion` subido **antes** de producción.
- [ ] Inventario PII actualizado.
- [ ] Probar firma inválida → 401; evento duplicado → no duplica `paid`.

# Relacionado

[/playbooks/payments-webhook-testing.md](/playbooks/payments-webhook-testing.md) · [/playbooks/rotate-payment-secrets.md](/playbooks/rotate-payment-secrets.md)
