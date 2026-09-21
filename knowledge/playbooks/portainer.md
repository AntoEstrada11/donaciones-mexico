---
type: Playbook
title: Desplegar en Portainer desde Gitea
description: Stack web + Postgres. Debe ser Compose standalone; Swarm no sirve con build.
tags: [deploy, docker, portainer, gitea]
timestamp: 2026-09-21T00:00:00Z
---

# Trigger

Publicar Donaciones México en el host donde corre Portainer.

# Compose, no Swarm

Este repo usa `build:` (Dockerfile). **Solo funciona** si el stack en Portainer es **Compose** (docker compose en el agente Docker).

Si Portainer lo trata como **Swarm**, verás avisos como:

- `Ignoring unsupported options: build, restart`
- `container_name … is not supported`
- `invalid image reference for service web: no image specified`
- a veces también `Unable to retrieve stack file` después del fallo

**Qué hacer:** borrar o dejar de usar ese stack Swarm. Crear uno nuevo:

1. Entorno = agente **Docker** (standalone), no el cluster Swarm.
2. **Stacks → Add stack → Repository** (Git).
3. Repo Gitea, rama `main`, Compose path `docker-compose.yml`.
4. En opciones del stack, que sea despliegue **Compose** / docker compose (no “Swarm stack”).
5. Variables de entorno (tabla abajo).
6. Deploy con **build** de `web` (el primer build tarda).

El webhook de Gitea debe apuntar a **ese** stack Compose. Si el webhook quedó ligado al stack Swarm, reconfigúralo al nuevo.

# Qué debe verse

Dos contenedores: **`donaciones-db`** y **`donaciones-web`** (puerto 3000).

# Piezas en el repo

| Archivo | Uso |
|---------|-----|
| `docker-compose.yml` | Único Compose: `db` + `web` |
| `Dockerfile` | Build Nuxt → Nitro |
| `docker-entrypoint.sh` | Migra y arranca Nitro |

En la PC, `npm run db:up` **solo** levanta `db`.

# Variables

| Variable | Obligatorio | Nota |
|----------|-------------|------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | sí | `DATABASE_URL` hacia `db` |
| `NUXT_AUTH_SECRET` | sí | Distinto al de desarrollo |
| `NUXT_PUBLIC_SITE_URL` | sí | URL pública HTTPS |
| `NUXT_PUBLIC_AUTH_HUB_URL` | sí | Sin slash final |
| `WEB_BIND` | no | default `0.0.0.0:3000` |

Tras el primer deploy, semilla una vez en la consola de `donaciones-web`:

```bash
node --experimental-strip-types server/database/seed.ts
```

Carrusel: subir fotos en `/admin/personalizar/carrusel`.

# Relacionado

[/decisions/portainer-stack.md](/decisions/portainer-stack.md)
