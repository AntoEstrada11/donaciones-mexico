---
type: System
title: Donaciones México
description: Plataforma de donaciones en línea para la Iglesia Universal del Reino de Dios en México.
tags: [nuxt, donaciones, mexico, iurd, postgres]
timestamp: 2026-08-18T00:00:00Z
---

# Resumen

Sitio web Nuxt 3 para que donantes en México registren cuenta, elijan iglesia y campaña, y generen donaciones (SPEI hoy; tarjeta/PayPal con arquitectura de pasarela acordada, cobro real pendiente de implementar). Inspirado en [doar.universal.org](https://doar.universal.org). Los datos de donantes y donaciones viven en una base PostgreSQL propia; ya no hay integración con Odoo para esos datos.

El sitio cumple la LFPDPPP vigente (21/03/2025): aviso integral y simplificado, consentimiento expreso para datos sensibles (creencias religiosas), derechos ARCO en autoservicio y minimización de datos fiscales. Ver [/legal/](/legal/).

# Stack

| Capa | Tecnología |
|------|------------|
| Frontend / SSR | Nuxt 3, Vue 3, Tailwind CSS |
| i18n | `@nuxtjs/i18n` (`es-MX`, `strategy: no_prefix`) |
| API | Nitro server routes en `server/api/` |
| Base de datos | PostgreSQL 17 (Docker en el mismo host) |
| Acceso a datos | Drizzle ORM + driver `postgres` |
| Auth | Token HMAC propio + scrypt; cuentas en la tabla `users` |
| Privacidad | Aviso en `/privacidad`, tabla `consents`, ARCO en `/perfil`; config en `utils/legal.ts` |
| Iglesias | API Odoo IURD MX vía Nitro; JSON de muestra si Odoo cae |
| Cobros | Diseño: MercadoPago (principal) + PayPal; checkout alojado; secretos en env. Ver [/integrations/](/integrations/) |

# Entradas útiles

- Código: raíz del repo (`pages/`, `server/`, `composables/`)
- Arranque: [/playbooks/run-local.md](/playbooks/run-local.md)
- Esquema de datos: [/data/postgres-schema.md](/data/postgres-schema.md)
- Privacidad y aviso: [/legal/aviso-privacidad.md](/legal/aviso-privacidad.md)
- Inventario PII: [/data/personal-data-inventory.md](/data/personal-data-inventory.md)
- Arquitectura: [/architecture.md](/architecture.md)
- Env de ejemplo: `.env.example` (nunca copiar secretos a este bundle)

# Estado

Fase funcional: registro, login, perfil (con ARCO), directorio de iglesias, alta de donaciones `pending`, historial, panel admin (**Personalizar**: carrusel y pie/SPEI), tutorial SPEI (`/spei`) y páginas legales (`/privacidad`, `/terminos`), persistido en PostgreSQL. **Sin cobros reales aún**; arquitectura de pasarelas documentada (MP + PayPal v1). Sin donación recurrente ni emisión de CFDI. Pendiente jurídico: confirmar domicilio y buzón ARCO en `utils/legal.ts`. Backlog: [/roadmap.md](/roadmap.md).
