---
type: Decision
title: Iglesias vía WordPress
description: El directorio de iglesias consume la API pública IURD MX, no Nitro.
tags: [decision, churches]
timestamp: 2026-08-18T00:00:00Z
---

# Contexto

El listado real de templos ya existe en WordPress (`/wp-json/iurd/v1/churches`).

# Decisión

Nitro (`GET /api/churches`) llama esa URL con geolocalización. El cliente no habla con WordPress. `churches.json` es muestra del shape y **fallback** si WP no responde (p. ej. HTTP 500 en `/wp-json/`).

# Consecuencias

- **+** Datos oficiales y distancia real sin duplicar catálogo cuando WP está sano.
- **+** El donante puede seguir el flujo con el JSON de ejemplo si WP cae.
- **−** Dependencia de red y del contrato WP; el fallback no tiene el listado real.

# Cuándo reconsiderar

Si se necesita caché server-side, offline, o el contrato WP cambia de forma incompatible.
