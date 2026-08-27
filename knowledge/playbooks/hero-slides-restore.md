---
type: Playbook
title: Carrusel del home tras instalación nueva
description: Copiar los JPG a public/uploads/hero no basta; hay que volver a cargarlos desde el panel admin.
tags: [hero, admin, install]
timestamp: 2026-08-18T00:00:00Z
---

# Trigger

Instalación nueva, `docker compose down -v`, restauración de esquema sin datos, o copiar `public/uploads/hero/` a otro entorno.

# Por qué el reel sale vacío

El archivo en disco y la slide del carrusel **no son lo mismo**.

| Pieza | Dónde vive | Quién la usa |
|-------|------------|--------------|
| JPG/PNG/WebP | `public/uploads/hero/` (gitignored) | El navegador, si ya hay URL |
| Metadatos | tabla `hero_slides` (`filename`, `alt`, `sort_order`, `active`) | `GET /api/hero-slides` y el home |

El home solo pinta lo que devuelve la API. Esa API **solo lee PostgreSQL**. Copiar los archivos al directorio no inserta filas. Una base nueva (migrate + seed) siembra campañas, **no** slides.

# Qué hacer

1. Inicia sesión con una cuenta `admin`.
2. Abre `/admin/personalizar/carrusel`.
3. Sube de nuevo cada imagen del reel (archivo + texto alternativo). Eso escribe el fichero **y** la fila juntos.

No hace falta insertar SQL a mano. Si en disco quedaron JPG huérfanos de una instalación anterior, se pueden borrar; el alta desde el panel crea nombres uuid nuevos.

# Verificación

`GET /api/hero-slides` debe devolver un array con `url` tipo `/uploads/hero/<uuid>.jpg`. Sin filas, el hero usa solo el color de marca.

# Relacionado

[/data/postgres-schema.md](/data/postgres-schema.md) · [/apis/hero-slides-get.md](/apis/hero-slides-get.md) · [/playbooks/promote-admin.md](/playbooks/promote-admin.md)
