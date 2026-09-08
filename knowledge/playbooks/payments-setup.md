---
type: Playbook
title: Configurar pasarelas de pago
description: Alta de apps, llaves test/live y URLs de webhook (MercadoPago y PayPal).
tags: [playbook, payments, ops]
timestamp: 2026-09-07T00:00:00Z
---

# Antes de empezar

Código de cobro v1 en `server/payments/` y panel `/admin/personalizar/cobros`. Ver [/integrations/](/integrations/).

# Variables

Copiar nombres desde `.env.example` (nunca valores reales a `knowledge/`).

| Variable | Uso |
|----------|-----|
| `NUXT_PUBLIC_SITE_URL` | Retorno del navegador en producción (HTTPS del sitio). En local puede ser `http://localhost:PORT`. |
| `NUXT_PAYMENT_WEBHOOK_BASE_URL` | Base HTTPS pública para webhooks (y, en local, también `back_urls` de MP). Ej. túnel ngrok. |
| `NUXT_MP_*` / `NUXT_PAYPAL_*` | Secretos solo servidor (test y live). |

# Local con túnel (ngrok)

1. `ngrok http <puerto-de-nuxt>` (debe coincidir con el puerto real; si Nuxt salta a 3001, el túnel también).
2. `NUXT_PAYMENT_WEBHOOK_BASE_URL=https://….ngrok-free.dev`
3. `NUXT_PUBLIC_SITE_URL=http://localhost:<puerto>` (opcional; MP usará el túnel HTTPS para `back_urls` + `auto_return`).
4. En `nuxt.config` ya están `vite.server.allowedHosts` para `.ngrok-free.dev` (sin eso, el Host del túnel da **403**).
5. Webhook MP: `{NUXT_PAYMENT_WEBHOOK_BASE_URL}/api/payments/webhook/mercadopago`
6. Reiniciar `npm run dev` tras cambiar `.env`.

# MercadoPago

1. App Checkout Pro en el panel MX.
2. Access Token de prueba → `NUXT_MP_ACCESS_TOKEN_TEST` (no el usuario `TESTUSER…`).
3. Webhook + secreto → `NUXT_MP_WEBHOOK_SECRET_TEST`.
4. Admin `/admin/personalizar/cobros`: modo test, habilitar tarjeta.

# PayPal

1. App sandbox: Client ID / Secret / Webhook ID → `NUXT_PAYPAL_*_TEST`.
2. Habilitar PayPal en `payment_settings` solo con credenciales presentes.

# Checklist de seguridad

- [ ] Secretos solo en env / secrets del host.
- [ ] HTTPS y URL pública correcta para webhooks (y back_urls en prod).
- [ ] Aviso con encargados MP/PayPal y `LEGAL.noticeVersion` al día.
- [ ] Firma inválida → 401; evento duplicado → no dobla `paid`.
- [ ] Simulador MP sin firma → 200 solo en modo test (no muta).

# Relacionado

[/playbooks/payments-webhook-testing.md](/playbooks/payments-webhook-testing.md) · [/playbooks/rotate-payment-secrets.md](/playbooks/rotate-payment-secrets.md)
