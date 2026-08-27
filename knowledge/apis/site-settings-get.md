---
type: API Endpoint
title: GET /api/site-settings
description: Contacto institucional y datos SPEI públicos (fila site_settings).
resource: /api/site-settings
tags: [api, site, spei]
timestamp: 2026-08-27T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** ninguna
- **Handler:** `server/api/site-settings.get.ts`
- **Repositorio:** `getSiteSettings()` en `server/utils/siteSettings.ts`

# Respuesta

`SiteSettings`: `contactPhone`, `contactEmail`, `speiBank`, `speiBeneficiary`, `speiClabe`, `speiConcept`, `updatedAt`.

Si no hay fila, se inserta la semilla por defecto (`utils/siteSettingsDefaults.ts`).

# Consumidores

Pie (`AppFooter`), `SpeiBankDetails`, `/spei` vía `composables/useSiteSettings.ts` (`useAsyncData` key `site-settings`).

Edición: [/apis/admin.md](/apis/admin.md) (`GET/PATCH /api/admin/site-settings`). Tras guardar en admin, `refreshNuxtData('site-settings')` — no `clearNuxtData`, que vacía el pie hasta recargar.
