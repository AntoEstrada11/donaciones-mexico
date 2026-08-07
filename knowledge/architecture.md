---
type: Reference
title: Arquitectura
description: Vista de alto nivel de componentes y flujo de datos de Donaciones México.
tags: [architecture]
timestamp: 2026-08-07T00:00:00Z
---

# Flujo

1. El navegador carga páginas Nuxt (`pages/`) con layout y i18n.
2. Auth: registro/login contra la tabla `users` → token Bearer HMAC → guardado en `sessionStorage` (`composables/useAuth.ts`).
3. Perfil (`/api/me`): lee y escribe `users` + `donor_profiles` en PostgreSQL.
4. Iglesias: el cliente llama la API WordPress IURD (`runtimeConfig.public.churchesApiUrl`) vía `useChurches`. No hay tabla local de iglesias; las donaciones guardan el identificador externo.
5. Campañas y donaciones: Nitro consulta PostgreSQL mediante Drizzle. `POST /api/donations` persiste la donación y la asocia al donante si hay sesión.
6. Validación de formularios: `utils/fieldLimits.ts` en cliente y servidor (ver [/data/field-limits.md](/data/field-limits.md)).

# Componentes

| Pieza | Rol |
|-------|-----|
| `pages/` | Rutas UI: `/`, `/iglesias`, `/donaciones`, `/historial`, `/login`, `/registro`, `/perfil` |
| `utils/fieldLimits.ts` | Límites y sanitización compartidos UI + API |
| `server/api/` | Contratos HTTP Nitro |
| `server/database/schema.ts` | Definición Drizzle de las tablas |
| `server/database/migrations/` | SQL generado por `drizzle-kit` |
| `server/utils/db.ts` | Conexión perezosa y pool de PostgreSQL |
| `server/utils/users.ts` | Repositorio de cuentas y perfiles |
| `server/utils/donations.ts` | Repositorio de campañas y donaciones |
| `server/utils/auth.ts` | Hash scrypt, firmar/verificar token, `requireSession` y `optionalSession` |
| `composables/useAuth.ts` | Sesión en cliente y llamadas autenticadas |
| `composables/useChurches.ts` | Fetch + mapeo de iglesias externas |
| `docker-compose.yml` | Servicio PostgreSQL con volumen persistente |

# Frontera de datos

La única fuente de verdad de donantes y donaciones es PostgreSQL. Las iglesias son datos externos de solo lectura. `server/data/campaigns.json` es semilla de arranque, no fuente de verdad en runtime.

# Decisiones relacionadas

Ver [decisions/](/decisions/), en particular [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md).
