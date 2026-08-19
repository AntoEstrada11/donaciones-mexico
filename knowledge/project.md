---
type: System
title: Donaciones México
description: Plataforma de donaciones en línea para la Iglesia Universal del Reino de Dios en México.
tags: [nuxt, donaciones, mexico, iurd, postgres]
timestamp: 2026-08-18T00:00:00Z
---

# Resumen

Sitio web Nuxt 3 para que donantes en México registren cuenta, elijan iglesia y campaña, y generen donaciones (SPEI/tarjeta, sin pasarela real aún). Inspirado en [doar.universal.org](https://doar.universal.org). Los datos de donantes y donaciones viven en una base PostgreSQL propia; ya no hay integración con Odoo.

# Stack

| Capa | Tecnología |
|------|------------|
| Frontend / SSR | Nuxt 3, Vue 3, Tailwind CSS |
| i18n | `@nuxtjs/i18n` (`es-MX`, `strategy: no_prefix`) |
| API | Nitro server routes en `server/api/` |
| Base de datos | PostgreSQL 17 (Docker en el mismo host) |
| Acceso a datos | Drizzle ORM + driver `postgres` |
| Auth | Token HMAC propio + scrypt; cuentas en la tabla `users` |
| Iglesias | API WordPress IURD MX vía Nitro; JSON de muestra si WP cae |

# Entradas útiles

- Código: raíz del repo (`pages/`, `server/`, `composables/`)
- Arranque: [/playbooks/run-local.md](/playbooks/run-local.md)
- Esquema de datos: [/data/postgres-schema.md](/data/postgres-schema.md)
- Arquitectura: [/architecture.md](/architecture.md)
- Env de ejemplo: `.env.example` (nunca copiar secretos a este bundle)

# Estado

Fase funcional: registro, login, perfil, directorio de iglesias, alta de donaciones, historial, panel admin y tutorial SPEI (`/spei`), persistido en PostgreSQL. Sin cobros reales, sin donación recurrente ni emisión de CFDI. Backlog: [/roadmap.md](/roadmap.md).
