---
type: Playbook
title: Correr en local
description: Postgres en Docker, migraciones y servidor de desarrollo.
tags: [dev, local, docker]
timestamp: 2026-09-04T00:00:00Z
---

# Trigger

Desarrollar en la máquina local. **Esto no sustituye la base de Vercel.**

# Requisitos

Node.js 18+ (en Windows 22 los scripts ya llevan `--experimental-strip-types`), npm y Docker Desktop en marcha.

# Steps

1. `npm install`
2. Copiar `.env.example` → `.env` si no existe. En Windows `DATABASE_URL` debe usar `127.0.0.1`, no `localhost`.
3. Base + esquema + campañas:

```bash
npm run db:setup
```

4. `npm run dev`
5. [http://localhost:3000](http://localhost:3000) — **Iniciar sesión** cubre donante y operación.
6. Donantes de prueba: [/playbooks/dev-bulk-contacts.md](/playbooks/dev-bulk-contacts.md).

# Scripts

| Script | Qué hace |
|--------|----------|
| `npm run db:up` | Arranca `donaciones-db` (Postgres 17) |
| `npm run db:setup` | Arranca, migra y siembra |
| `npm run db:down` | Apaga el contenedor (el volumen `db-data` se conserva) |

# Inspeccionar

```bash
docker exec -it donaciones-db psql -U donaciones -d donaciones
```

# Problemas frecuentes

| Síntoma | Causa | Salida |
|---------|-------|--------|
| `ECONNREFUSED ::1:5432` | `localhost` en IPv6 | `127.0.0.1` en `DATABASE_URL` |
| `ECONNREFUSED 127.0.0.1:5432` | Docker abajo | Docker Desktop + `npm run db:up` |
| `relation "users" does not exist` | Sin migrar | `npm run db:migrate` |
