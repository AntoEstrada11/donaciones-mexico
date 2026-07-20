---
type: Data File
title: Campañas mock
description: JSON estático de tipos de donación (campañas).
resource: server/data/campaigns.json
tags: [data, campaigns]
timestamp: 2026-07-20T00:00:00Z
---

# Ubicación

- Path en repo: `server/data/campaigns.json`
- Servido por: `GET /api/campaigns`

# Formato

Array de objetos `Campaign`: `id`, `name`, `slug`, `description`, `type`.

# Operación

Editar el JSON y reiniciar/recargar el servidor Nitro en desarrollo.
