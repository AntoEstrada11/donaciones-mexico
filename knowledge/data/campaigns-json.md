---
type: Data File
title: Semilla de campañas
description: JSON de arranque que alimenta la tabla campaigns; no es fuente de verdad en runtime.
resource: server/data/campaigns.json
tags: [data, campaigns, seed]
timestamp: 2026-08-06T00:00:00Z
---

# Ubicación

- Path en repo: `server/data/campaigns.json`
- Consumido por: `server/database/seed.ts` (`npm run db:seed`)

# Formato

Array de objetos con `name`, `slug`, `description`, `type`. El orden del array define `sort_order` en la tabla.

# Operación

`npm run db:seed` hace upsert por `slug`: agrega las campañas nuevas y actualiza nombre, descripción, tipo y orden de las existentes. Es idempotente y seguro de repetir.

Para dar de baja una campaña no se borra del JSON: se marca `active = false` en la tabla, para no romper las donaciones históricas que la referencian.

En runtime la API lee la tabla `campaigns`, no este archivo. Ver [/data/postgres-schema.md](/data/postgres-schema.md).
