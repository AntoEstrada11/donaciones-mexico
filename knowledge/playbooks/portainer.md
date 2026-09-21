---
type: Playbook
title: Desplegar en Portainer desde Gitea
description: Stack web + Postgres. El webhook de Gitea usa docker-compose.yml (db y Nuxt).
tags: [deploy, docker, portainer, gitea]
timestamp: 2026-09-21T00:00:00Z
---

# Trigger

Publicar Donaciones México en el host donde corre Portainer.

# Qué debe verse en el stack

Dos contenedores: **`donaciones-db`** (Postgres) y **`donaciones-web`** (Nuxt en el puerto 3000). Si solo aparece la base, el compose viejo no traía `web` o Portainer no está reconstruyendo la imagen.

# Piezas en el repo

| Archivo | Uso |
|---------|-----|
| `docker-compose.yml` | **db + web** — path por defecto del webhook Gitea → Portainer |
| `docker-compose.portainer.yml` | El mismo stack (si el stack ya apuntaba a este path) |
| `Dockerfile` | Build Nuxt → Nitro |
| `docker-entrypoint.sh` | Migra y arranca Nitro |

En la PC, `npm run db:up` **solo** levanta `db`, para no pelear el puerto 3000 con `npm run dev`.

# En Portainer

1. Stack desde Git, repo Gitea, rama `main`.
2. **Compose path:** `docker-compose.yml` (o `docker-compose.portainer.yml`; ambos tienen `web`).
3. Activar **build / recreate / pull and rebuild** del servicio `web`. Sin rebuild, el webhook puede dejar solo Postgres.
4. Variables de entorno del stack: `POSTGRES_*`, `NUXT_AUTH_SECRET`, `NUXT_PUBLIC_SITE_URL`, Hub, pagos si aplican. Ver tabla abajo.
5. Tras el primer deploy, semilla de campañas **una vez** en la consola de `donaciones-web`:

```bash
node --experimental-strip-types server/database/seed.ts
```

6. Carrusel: subir fotos en `/admin/personalizar/carrusel`.

| Variable | Obligatorio | Nota |
|----------|-------------|------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | sí | `DATABASE_URL` hacia el servicio `db` |
| `NUXT_AUTH_SECRET` | sí | Distinto al de desarrollo |
| `NUXT_PUBLIC_SITE_URL` | sí | URL pública HTTPS |
| `NUXT_PUBLIC_AUTH_HUB_URL` | sí | Sin slash final |
| `WEB_BIND` | no | default `0.0.0.0:3000` |

# Relacionado

[/decisions/portainer-stack.md](/decisions/portainer-stack.md)
