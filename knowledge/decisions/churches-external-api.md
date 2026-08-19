---
type: Decision
title: Iglesias vía WordPress
description: El directorio de iglesias consumía la API pública IURD MX en WordPress. Superada.
tags: [decision, churches, superseded]
timestamp: 2026-08-18T00:00:00Z
---

> **Superada el 2026-08-19.** WordPress se da de baja; Nitro consulta Odoo directamente.
> Ver [/decisions/churches-odoo-direct.md](/decisions/churches-odoo-direct.md).

# Contexto (histórico)

El listado real de templos existía en WordPress (`/wp-json/iurd/v1/churches`), que a su vez
consumía Odoo en `miembros.iurdsys.net`.

# Decisión (histórica)

Nitro (`GET /api/churches`) llamaba esa URL con geolocalización. El cliente no hablaba con
WordPress. `churches.json` era muestra del shape y **fallback** si WP no respondía.

# Por qué se reemplazó

WordPress era un intermediario con paginación de 10 ítems y caché propia. Al apagarse, el proxy
directo a Odoo simplifica la arquitectura y devuelve el catálogo completo.
