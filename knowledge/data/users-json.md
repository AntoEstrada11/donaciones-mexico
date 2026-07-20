---
type: Data File
title: Usuarios locales
description: Store JSON de cuentas de la app (email = id); excluido de git.
resource: server/data/users.json
tags: [data, auth]
timestamp: 2026-07-20T00:00:00Z
---

# Ubicación

- Path en disco: `server/data/users.json` (creado en runtime)
- Acceso: `server/utils/users.ts`
- Git: ignorado (`.gitignore`)

# Formato

Array de `AppUser`: `id` (= email), `email`, `name`, `phone?`, `passwordHash` (`salt:hash` scrypt), `odooPartnerId`, `profileComplete`, `createdAt`.

# Operación

Se crea al primer registro. No versionar; no pegar hashes o datos reales en este bundle.
