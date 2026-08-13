---
type: API Endpoint
title: Admin API
description: Endpoints protegidos requireAdmin para estadísticas, slides, donaciones y usuarios.
resource: /api/admin/*
tags: [api, admin]
timestamp: 2026-08-07T00:00:00Z
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
| GET | `/api/admin/users` | Listado de usuarios |
| PATCH | `/api/admin/users/:id/role` | `{ role: "admin" \| "donor" }` |

# Archivos

Subidas en `public/uploads/hero/` (gitignored). Metadatos en tabla `hero_slides`.

# UI

Panel en `/admin` (middleware `admin`). Ver [/decisions/admin-role.md](/decisions/admin-role.md).
