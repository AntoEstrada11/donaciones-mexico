---
type: Data File
title: Iglesias de muestra
description: JSON local de iglesias de ejemplo; fallback si WordPress no responde.
resource: server/data/churches.json
tags: [data, churches]
timestamp: 2026-08-18T00:00:00Z
---

# Ubicación

- Path en repo: `server/data/churches.json`

# Formato

Array de `Church` (`id`, `name`, `city`, `state`, `address`, `slug`).

# Operación

`GET /api/churches` intenta primero la API WordPress. Si falla, lee este archivo y marca `source: sample`.

No sustituye el catálogo oficial: distancias e imágenes reales solo llegan con WordPress.

Fuente primaria: [/apis/churches-external.md](/apis/churches-external.md) · contrato: [/apis/churches-get.md](/apis/churches-get.md).
