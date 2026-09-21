---
type: API Endpoint
title: GET /api/zip/:cp
description: Sugiere colonias y estado a partir de un código postal mexicano (solo 5 dígitos).
resource: /api/zip
tags: [api, profile]
timestamp: 2026-09-14T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** ninguna
- **Handler:** `server/api/zip/[cp].get.ts`
- **Upstream:** `https://api.zippopotam.us/mx/{cp}` (solo el C.P.; sin nombre ni RFC)

# Respuesta

`{ zip, state, colonies: string[] }`

# Errores

| Código | Causa |
|--------|--------|
| 400 | C.P. distinto de 5 dígitos |
| 502 | El catálogo no respondió |
| 429 | Límite de tasa |

Ver aviso integral sección 7 y [/data/personal-data-inventory.md](/data/personal-data-inventory.md).
