---
type: Decision
title: Iglesias vía WordPress
description: El directorio de iglesias consume la API pública IURD MX, no Nitro.
tags: [decision, churches]
timestamp: 2026-07-20T00:00:00Z
---

# Contexto

El listado real de templos ya existe en WordPress (`/wp-json/iurd/v1/churches`).

# Decisión

El front llama esa URL (`churchesApiUrl`) con geolocalización; no hay `GET /api/churches` en Nitro. Se conserva `churches.json` solo como muestra/respaldo.

# Consecuencias

- **+** Datos oficiales y distancia real sin duplicar catálogo.
- **−** Dependencia de red/CORS y del contrato WP externo.

# Cuándo reconsiderar

Si se necesita caché server-side, offline, o el contrato WP cambia de forma incompatible.
