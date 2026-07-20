---
type: Reference
title: Arquitectura
description: Vista de alto nivel de componentes y flujo de datos de Donaciones México.
tags: [architecture]
timestamp: 2026-07-20T00:00:00Z
---

# Flujo

1. El navegador carga páginas Nuxt (`pages/`) con layout y i18n.
2. Auth: registro/login → token Bearer (HMAC) → guardado en cliente (`composables/useAuth.ts`).
3. Perfil (`/api/me`): lee/actualiza usuario local y, si hay Odoo, sincroniza `res.partner`.
4. Iglesias: el cliente llama la API WordPress IURD (`runtimeConfig.public.churchesApiUrl`) vía `useChurches`.
5. Campañas y donaciones mock: Nitro sirve JSON desde `server/data/` o crea donaciones en memoria (`POST /api/donations` no persiste aún).

# Componentes

| Pieza | Rol |
|-------|-----|
| `pages/` | Rutas UI: `/`, `/iglesias`, `/donaciones`, `/historial`, `/login`, `/registro`, `/perfil` |
| `server/api/` | Contratos HTTP Nitro |
| `server/utils/auth.ts` | Hash scrypt, firmar/verificar token, `requireSession` |
| `server/utils/users.ts` | CRUD local de usuarios (`users.json`) |
| `server/utils/odoo.ts` | JSON-RPC Odoo; mock de partner id si no hay config |
| `composables/useAuth.ts` | Sesión en cliente |
| `composables/useChurches.ts` | Fetch + mapeo de iglesias externas |
| `server/data/*.json` | Campañas, donaciones e iglesias de muestra |

# Decisiones relacionadas

Ver [decisions/](/decisions/).
