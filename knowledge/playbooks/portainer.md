---
type: Playbook
title: Desplegar en Portainer desde Gitea
description: Stack Swarm db + web. La imagen Nuxt se construye en el host; Swarm no usa build.
tags: [deploy, docker, portainer, gitea, swarm]
timestamp: 2026-09-21T00:00:00Z
---

# Trigger

Publicar Donaciones México en Portainer (entorno Swarm).

# Por qué no hay `build:` en el compose

Swarm **ignora** `build`, `restart` y `container_name`. Si el compose trae `build:`, Portainer responde `no image specified` en `web`.

El compose usa `image: donaciones-web:latest` (o `DONACIONES_WEB_IMAGE`). Hay que **construir esa imagen en el nodo** antes de (o al actualizar) el stack.

# Orden cada vez que cambia el código

En el **servidor** (SSH en el nodo donde corre Portainer/Swarm), con el repo clonado o un checkout fresco:

```bash
cd /ruta/al/Donaciones-Mexico
git pull origin main
docker build -t donaciones-web:latest .
```

Luego en Portainer: **Pull and redeploy** del stack (o el webhook de Gitea).

Sin el `docker build`, el stack no puede arrancar `web`.

# Stack en Portainer

1. Repo Gitea, rama `main`, Compose path `docker-compose.yml`.
2. Variables: `POSTGRES_*`, `NUXT_AUTH_SECRET`, `NUXT_PUBLIC_SITE_URL`, Hub, etc.
3. Opcional: `DONACIONES_WEB_IMAGE=donaciones-web:latest` (default).
4. Deploy. Deben existir servicios/tareas de `db` y `web`. Web en el puerto **3000**.

# Primera vez

Semilla de campañas (una vez), en un contenedor/tarea de `web`:

```bash
node --experimental-strip-types server/database/seed.ts
```

Carrusel: `/admin/personalizar/carrusel`.

# Local (PC)

`npm run db:up` sigue levantando Postgres en el puerto 5432. No hace falta la imagen `donaciones-web` para desarrollar con `npm run dev`.

# Relacionado

[/decisions/portainer-stack.md](/decisions/portainer-stack.md)
