---
type: Playbook
title: Configurar pasarelas de pago
description: Alta de apps, llaves test/live y URLs de webhook (MercadoPago y PayPal).
tags: [playbook, payments, ops]
timestamp: 2026-09-07T00:00:00Z
---

# Antes de empezar

Código de cobro v1 en `server/payments/` y panel `/admin/personalizar/cobros`. Ver [/integrations/](/integrations/).

# Dónde van las llaves

Nunca el número de tarjeta ni el CVV. Eso se escribe en la página de Mercado Pago o PayPal al pagar.

En el stack de Portainer, **Environment variables** (y en local, el archivo `.env`). Nombres en `.env.example`. Tras cambiarlas, redesplegar el stack o reiniciar `npm run dev`. Luego en `/admin/personalizar/cobros`: modo **test** y activar tarjeta o PayPal.

# Variables

Copiar nombres desde `.env.example` (nunca valores reales a `knowledge/`).

| Variable | Uso |
|----------|-----|
| `NUXT_PUBLIC_SITE_URL` | Retorno del navegador en producción (HTTPS del sitio). En local puede ser `http://localhost:PORT`. |
| `NUXT_PAYMENT_WEBHOOK_BASE_URL` | Base HTTPS de webhooks. En el sitio publicado: `https://dona-test.iurdsys.net`. En local se omite y se usa `NUXT_PUBLIC_SITE_URL`. |
| `NUXT_MP_*` / `NUXT_PAYPAL_*` | Secretos solo servidor (test y live). |

# Local

1. `NUXT_PUBLIC_SITE_URL=http://localhost:3000`
2. Llaves `*_TEST` en `.env`. Reiniciar `npm run dev`.
3. Abrir http://localhost:3000 y donar. La tarjeta y PayPal se escriben en la página del proveedor.
4. Los avisos automáticos (webhooks) van al sitio publicado: `https://dona-test.iurdsys.net/api/payments/webhook/mercadopago` y `.../paypal`. En local, al volver se confirma el cobro con la API.

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
