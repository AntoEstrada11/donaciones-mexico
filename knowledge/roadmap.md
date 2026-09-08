---
type: Reference
title: Roadmap
description: Hecho, en curso y fuera de alcance hasta tener pasarela o fiscal.
tags: [roadmap]
timestamp: 2026-09-07T00:00:00Z
---

# Hecho

- Sitio público: home, iglesias, donación, historial, login, registro, perfil.
- Panel `/admin` (stats, **Personalizar** con Carrusel y Pie, donaciones, usuarios).
- Persistencia PostgreSQL (donantes, campañas, donaciones, slides, consentimientos, `site_settings`).
- Tutorial SPEI en `/spei` (datos bancarios desde `site_settings`, pasos, copia al portapapeles).
- **Cumplimiento LFPDPPP:** aviso integral (`/privacidad`), términos (`/terminos`), aviso simplificado en formularios, tabla `consents`, ARCO en `/perfil`, datos fiscales bajo demanda (`wants_receipt`), geolocalización opt-in en iglesias, rate limiting en auth/donaciones. Ver [/legal/](/legal/).
- Límite de tasa por IP en login, registro, donaciones y escrituras de `/api/me`.
- **Pasarela v1 implementada:** MercadoPago Checkout Pro + PayPal Orders v2; webhooks firmados; panel Cobros; tablas `payment_*`. Ver [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md).
- Límite de tasa por IP en login, registro, donaciones, checkout y escrituras de `/api/me`.
- **Arquitectura de pasarelas:** puerto interno + adaptadores; checkout alojado; secretos en env.

# En curso / siguiente implementación

| Ítem | Nota |
|------|------|
| Credenciales test/live en host | [/playbooks/payments-setup.md](/playbooks/payments-setup.md); panel Cobros. |
| Túnel local (ngrok) | `NUXT_PAYMENT_WEBHOOK_BASE_URL` + `vite.allowedHosts`; puerto del túnel = puerto de Nuxt. |

# Pendiente de producto

| Ítem | Bloqueo |
|------|---------|
| Donación recurrente | Fase 2: MP `/preapproval`, PayPal Subscriptions (y opcionalmente Stripe Billing). |
| Adaptadores Stripe / Openpay | Fase 2; mismo puerto interno. Openpay útil para SPEI de comisión fija. |
| Conciliación SPEI CLABE | El admin puede marcar `paid` a mano; sin cruce bancario automático. |
| CFDI | RFC/domicilio bajo demanda; sin timbrado ni bloqueo por obligación fiscal de 5 años. |

# Pendiente jurídico / operativo (privacidad)

| Ítem | Nota |
|------|------|
| Confirmar `LEGAL.domicilio` | Marcador en `utils/legal.ts`; requisito del aviso |
| Confirmar buzón ARCO dedicado | Hoy `donaciones@mx.universal.org` |
| Revisión jurídica del aviso | Borrador técnico alineado a la ley, no asesoría legal |
| Rate limit multi-instancia | Store compartido si hay varias réplicas de Nitro |

# Pendiente de endurecimiento

- Sesión en cookie `HttpOnly` (hoy token en `sessionStorage`).
- Nombre histórico de la iglesia en la donación (hoy solo `church_external_id`).
- Cabeceras CSP/HSTS al activar redirects de pasarela.

# Fuera de alcance hasta decisión

Cifrado de RFC en reposo, WAF, JWT estándar. Ver [/security/layers.md](/security/layers.md).
