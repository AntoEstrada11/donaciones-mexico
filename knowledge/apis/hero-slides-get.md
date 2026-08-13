---
type: API Endpoint
title: GET /api/hero-slides
description: Lista slides activas del carrusel del home, ordenadas.
resource: /api/hero-slides
tags: [api, hero]
timestamp: 2026-08-07T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** ninguna
- **Handler:** `server/api/hero-slides.get.ts`

# Respuesta

Array de `HeroSlide`: `id`, `url` (`/uploads/hero/...`), `alt`, `sortOrder`, `active`, `createdAt`.

Solo filas con `active = true`. Sin slides, el home usa el color `brand` como fondo.
