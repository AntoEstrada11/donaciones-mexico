---
type: Decision
title: Iglesias directo desde Odoo
description: Nitro consulta miembros.iurdsys.net/api/churches; WordPress queda fuera del camino.
tags: [decision, churches, odoo, security]
timestamp: 2026-08-19T00:00:00Z
---

# Contexto

El directorio de templos vivía en Odoo y WordPress lo exponía en `/wp-json/iurd/v1/churches`.
WordPress se dará de baja pronto. Nitro ya proxyeaba WP con fallback a `churches.json`.

# Decisión

`GET /api/churches` llama **directamente** a Odoo:

- URL: `https://miembros.iurdsys.net/api/churches`
- API key en header `X-API-Key` (`NUXT_CHURCHES_API_KEY`), solo en servidor
- Host allowlist, HTTPS obligatorio, caché 1 h, rate limit y validación de respuesta
- El cliente sigue sin hablar con Odoo

# Consecuencias

- **+** Elimina dependencia de WordPress antes del apagado.
- **+** Recibe el catálogo completo (~253 iglesias) en una llamada; la búsqueda local en `/iglesias` cubre todo el listado.
- **+** Menos saltos de red y control explícito de seguridad en Nitro.
- **−** Dependencia directa del SLA y contrato de Odoo.
- **−** La API key debe rotarse fuera del repo; nunca en `knowledge/`.

# Cuándo reconsiderar

Si Odoo exige otro esquema de auth, cambia el shape de `results`, o hace falta caché compartida
entre réplicas (Redis).

# Relacionados

- [/apis/churches-external.md](/apis/churches-external.md)
- [/decisions/churches-external-api.md](/decisions/churches-external-api.md) (decisión anterior vía WordPress)
