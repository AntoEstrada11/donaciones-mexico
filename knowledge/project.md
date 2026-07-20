---
type: System
title: Donaciones México
description: Plataforma de donaciones en línea para la Iglesia Universal del Reino de Dios en México.
tags: [nuxt, donaciones, mexico, iurd]
timestamp: 2026-07-20T00:00:00Z
---

# Resumen

Sitio web Nuxt 3 para que donantes en México registren cuenta, elijan iglesia y campaña, y generen donaciones (SPEI/tarjeta, sin pasarela real aún). Inspirado en [doar.universal.org](https://doar.universal.org). Los contactos de donantes se sincronizan con Odoo como `res.partner` (sin crear `res.users`); si Odoo no está configurado, opera en modo mock.

# Stack

| Capa | Tecnología |
|------|------------|
| Frontend / SSR | Nuxt 3, Vue 3, Tailwind CSS |
| i18n | `@nuxtjs/i18n` (`es-MX`, `strategy: no_prefix`) |
| API | Nitro server routes en `server/api/` |
| Auth local | HMAC token + scrypt; usuarios en `server/data/users.json` |
| CRM (opcional) | Odoo JSON-RPC (`res.partner`) |
| Iglesias | API WordPress pública IURD MX |

# Entradas útiles

- Código: raíz del repo (`pages/`, `server/`, `composables/`)
- Arranque: [/playbooks/run-local.md](/playbooks/run-local.md)
- Arquitectura: [/architecture.md](/architecture.md)
- Env de ejemplo: `.env.example` (nunca copiar secretos a este bundle)

# Estado

Fase funcional con login/registro, perfil, iglesias, donaciones e historial mock. Sin cobros reales ni autenticación de producción endurecida.
