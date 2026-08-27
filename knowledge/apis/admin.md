---
type: API Endpoint
title: Admin API
description: Endpoints protegidos requireAdmin para estadísticas, slides, donaciones y usuarios.
resource: /api/admin/*
tags: [api, admin]
timestamp: 2026-08-27T00:00:00Z
---

# Auth

Todas las rutas exigen `Authorization: Bearer` con `role === admin` (`requireAdmin`). Sin rol: 403.

# Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats` | Conteos de usuarios, donaciones por estado, slides activas |
| GET | `/api/admin/slides` | Todas las slides (incl. inactivas) |
| POST | `/api/admin/slides` | Multipart: `file` + `alt` opcional (JPG/PNG/WebP ≤ 3 MB) |
| PATCH | `/api/admin/slides/:id` | `alt`, `active`, `sortOrder` |
| DELETE | `/api/admin/slides/:id` | Borra fila y archivo en disco |
| GET | `/api/admin/donations` | Listado reciente enriquecido |
| PATCH | `/api/admin/donations/:id` | `{ status }` |
| GET | `/api/admin/users` | Listado de usuarios con estado y último cambio |
| PATCH | `/api/admin/users/:id/status` | `{ status: "active" \| "deactivated" }` — solo donantes |
| POST | `/api/admin/users/:id/password-reset` | Genera enlace de restablecimiento (24 h) |
| PATCH | `/api/admin/users/:id/role` | **Retirado** — responde `410`; el rol admin vendrá de servicio externo |
| GET | `/api/admin/site-settings` | Contacto y SPEI del pie |
| PATCH | `/api/admin/site-settings` | Actualiza contacto y SPEI |

El rol admin sigue en la base (`users.role`) y se asigna con `npm run db:promote-admin`. Ya no se promueve desde el panel.

# Archivos

Subidas en `public/uploads/hero/` (gitignored). Metadatos en tabla `hero_slides`.

El carrusel **no** lista el directorio. Solo muestra filas de esa tabla. En una instalación nueva, una migración sobre base vacía o al copiar los JPG a otro servidor, hay que volver a cargarlos desde `/admin/personalizar/carrusel`. Copiar archivos no crea las filas. Ver [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md).

# UI

Panel en `/admin` (middleware `admin`). **Personalizar** agrupa Carrusel (`/admin/personalizar/carrusel`) y Pie (`/admin/personalizar/pie`). `/admin/slides` redirige al carrusel. Confirmaciones destructivas o de publicación usan `ConfirmDialog` (no `window.confirm`). Ver [/decisions/admin-role.md](/decisions/admin-role.md).

Público de settings: [/apis/site-settings-get.md](/apis/site-settings-get.md). Tras `PATCH /api/admin/site-settings`, la UI llama `refreshNuxtData('site-settings')` para actualizar pie y SPEI en la misma sesión (no usar `clearNuxtData`: deja el footer vacío).
