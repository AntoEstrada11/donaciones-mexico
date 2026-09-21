---
type: Decision
title: Host de la aplicación en Portainer
description: Gitea es el git; Portainer levanta web y Postgres. El compose de la PC solo trae la base para npm run dev.
tags: [decision, deploy, portainer]
status: accepted
timestamp: 2026-09-21T00:00:00Z
---

# Decisión

El sitio en servidor se publica con **Portainer** leyendo **Gitea**. Compose de producción: `docker-compose.portainer.yml`.

`docker-compose.yml` en la raíz queda para desarrollo en la PC (Postgres en `127.0.0.1:5432`).

# Relacionado

[/playbooks/portainer.md](/playbooks/portainer.md)
