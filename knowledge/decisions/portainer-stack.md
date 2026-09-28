---
type: Decision
title: Host de la aplicación en Portainer
description: Gitea es el git; Portainer/Swarm despliega db + web con imagen preconstruida.
tags: [decision, deploy, portainer, swarm]
status: accepted
timestamp: 2026-09-21T00:00:00Z
---

# Decisión

El sitio en servidor se publica en el **Portainer** de Allan (red `AllanNet`, Traefik). La imagen del front es de la cuenta propia: `aneg/donaciones-mexico` en Docker Hub. URL: `https://donaciones.revelation.com.mx`, puerto interno 3000.

Tras cada cambio de código, en la PC: `docker build -t aneg/donaciones-mexico:latest .` y `docker push`.

En la PC, `npm run db:up` arranca solo Postgres para `npm run dev`.

# Relacionado

[/playbooks/portainer.md](/playbooks/portainer.md)
