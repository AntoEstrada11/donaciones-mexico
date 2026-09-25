---
type: Decision
title: Host de la aplicación en Portainer
description: Gitea es el git; Portainer/Swarm despliega db + web con imagen preconstruida.
tags: [decision, deploy, portainer, swarm]
status: accepted
timestamp: 2026-09-21T00:00:00Z
---

# Decisión

El sitio en servidor se publica con **Portainer** leyendo **Gitea**, igual que Luau: imagen `allanmontero/donaciones-mexico` en Docker Hub y Traefik en la red `AllanNet` (`https://donaciones.revelation.com.mx`, puerto interno 3000).

Tras cada cambio de código, en la PC: `docker build -t allanmontero/donaciones-mexico:latest .` y `docker push`.

En la PC, `npm run db:up` arranca solo Postgres para `npm run dev`.

# Relacionado

[/playbooks/portainer.md](/playbooks/portainer.md)
