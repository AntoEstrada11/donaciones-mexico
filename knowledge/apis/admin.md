---
type: API Endpoint
title: Admin API
description: Endpoints protegidos requireAdmin para estadísticas, slides, donaciones, donantes y alertas UMA/PLD.
resource: /api/admin/*
tags: [api, admin]
timestamp: 2026-11-03T00:00:00Z
---

# Auth

Todas las rutas exigen `Authorization: Bearer` con `role === admin` (`requireAdmin`). Sin rol: 403.

# Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats` | Conteos de usuarios, donaciones por estado, SPEI pending, slides activas, PLD/SAT |
| GET | `/api/admin/slides` | Todas las slides (incl. inactivas) |
| POST | `/api/admin/slides` | Multipart: `file` + `alt` opcional (JPG/PNG/WebP ≤ 3 MB) |
| PATCH | `/api/admin/slides/:id` | `alt`, `active`, `sortOrder` |
| DELETE | `/api/admin/slides/:id` | Borra fila y archivo en disco |
| GET | `/api/admin/donations` | Hasta 500 (máx. 2000). Query: `status`, `method`, `churchId`, `dateFrom`, `dateTo`, `minAmount`, `maxAmount`, `limit` |
| PATCH | `/api/admin/donations/:id` | `{ status }` — si pasa a `paid`, setea `paidAt` y refresca UMA |
| GET | `/api/admin/donors/:id` | Ficha 360°: cuenta, perfil fiscal, INE (estado), UMA, historial, recurrentes, solicitudes |
| POST | `/api/admin/donors/:id/requests` | `{ type: identity \| fiscal \| email_verify }` — crea/reenvía solicitud y correo al donante |
| PATCH | `/api/admin/donors/:id/requests/:requestId` | `{ status: resolved \| cancelled }` |
| GET | `/api/admin/campaigns` | Todas las campañas (incl. inactivas / fuera de ventana) |
| POST | `/api/admin/campaigns` | Alta temporal: `name`, `description?`, `startsAt?`, `endsAt?`, `active?` |
| PATCH | `/api/admin/campaigns/:id` | Actualiza nombre, vigencia, `active`, `sortOrder` |
| GET | `/api/admin/compliance-alerts` | Donantes en `pld_pending` o `sat_report` (refresca UMA al listar) |
| GET | `/api/admin/users` | Página: `scope=donors\|staff\|staff_candidates`, `q`, `role`, `status`, `churchId`, `page`, `pageSize` |
| GET | `/api/admin/users/church-options` | Iglesias distintas asignadas a donantes (filtro) |
| PATCH | `/api/admin/users/:id/status` | `{ status: "active" \| "deactivated" }` — solo donantes |
| POST | `/api/admin/users/:id/password-reset` | Genera enlace de restablecimiento (24 h) |
| PATCH | `/api/admin/users/:id/role` | `{ role: "donor" \| "editor" \| "admin" }` — admin/editor solo `@mx.universal.org` |
| PATCH | `/api/admin/donors/:id` | `{ homeChurchId?, homeChurchName? }` — iglesia del donante |
| GET | `/api/admin/site-settings` | Contacto y SPEI del pie |
| PATCH | `/api/admin/site-settings` | Actualiza contacto y SPEI |
| GET | `/api/admin/payment-settings` | Modo, métodos y flags de credenciales (sin secretos) |
| PATCH | `/api/admin/payment-settings` | Actualiza preferencias de cobro |

El rol admin sigue en la base (`users.role`) y se asigna con `npm run db:promote-admin`. Ya no se promueve desde el panel.

# Archivos

Subidas en `public/uploads/hero/` (gitignored). Metadatos en tabla `hero_slides`.

El carrusel **no** lista el directorio. Solo muestra filas de esa tabla. En una instalación nueva, una migración sobre base vacía o al copiar los JPG a otro servidor, hay que volver a cargarlos desde `/admin/personalizar/carrusel`. Copiar archivos no crea las filas. Ver [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md).

# UI

Panel en `/admin` (middleware `admin`). Seguimiento operativo:

- `/admin/spei` — cola SPEI `pending` (marcar pagada/fallida)
- `/admin/alertas` — umbrales PLD / aviso SAT
- `/admin/donantes/:id` — ficha 360° + botón **Solicitar…** (correo al donante)
- `/admin/campanas` — tipos de donación / campañas temporales con vigencia
- `/admin/donations` — listado con filtros de método, fechas y monto
- `/admin/users` — solo donantes; ficha rápida en drawer (solicitudes); ficha completa en `/admin/donantes/:id`
- `/admin/operadores` — admin/editor, candidatos `@mx.universal.org` y cobros
- `/admin/alertas`, `/admin/spei`, `/admin/donations` — abren el mismo drawer sin abandonar la lista

**Personalizar** agrupa Carrusel y Pie. **Operadores** agrupa Personal y Cobros (`/admin/operadores/cobros`). `/admin/personalizar/cobros` redirige a operadores. `/admin/slides` redirige al carrusel. Confirmaciones destructivas o de publicación usan `ConfirmDialog` (no `window.confirm`). Ver [/decisions/admin-role.md](/decisions/admin-role.md).

La ficha 360° expone PII operativa (correo, teléfono, RFC, domicilio fiscal) solo a admin; no incluye bytes de INE ni hashes. No registrar esos campos en logs. El público solo ve campañas `active` dentro de `starts_at`/`ends_at` (`GET /api/campaigns`, `GET /api/me/requests` para pendientes del donante).

Público de settings: [/apis/site-settings-get.md](/apis/site-settings-get.md). Tras `PATCH /api/admin/site-settings`, la UI llama `refreshNuxtData('site-settings')` para actualizar pie y SPEI en la misma sesión (no usar `clearNuxtData`: deja el footer vacío).
