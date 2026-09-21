---
type: Decision
title: Host de la aplicación en Portainer
description: Gitea es el git; Portainer/Swarm despliega db + web con imagen preconstruida.
tags: [decision, deploy, portainer, swarm]
status: accepted
timestamp: 2026-09-21T00:00:00Z
---

# Decisión

El sitio en servidor se publica con **Portainer + Swarm** leyendo **Gitea**. `docker-compose.yml` define Postgres y Nuxt por **`image:`**, no por `build:` (Swarm no construye).

Tras cada cambio de código: `docker build -t donaciones-web:latest .` en el nodo y redespliegue del stack.

En la PC, `npm run db:up` arranca solo Postgres para `npm run dev`.

# Relacionado

[/playbooks/portainer.md](/playbooks/portainer.md)
