---
type: Decision
title: Host de la aplicación en Portainer
description: Gitea es el git; Portainer levanta web y Postgres. El compose de la PC solo trae la base para npm run dev.
tags: [decision, deploy, portainer]
status: accepted
timestamp: 2026-09-21T00:00:00Z
---

# Decisión

El sitio en servidor se publica con **Portainer** leyendo **Gitea**, como stack **Compose** (no Swarm). `docker-compose.yml` define Postgres y Nuxt con `build:`. Swarm ignora `build` y no puede levantar `web`. En la PC, `npm run db:up` arranca solo `db`.

# Relacionado

[/playbooks/portainer.md](/playbooks/portainer.md)
