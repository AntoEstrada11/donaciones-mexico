---
type: Reference
title: Arquitectura
description: Vista de alto nivel de componentes y flujo de datos de Donaciones México.
tags: [architecture]
timestamp: 2026-08-27T00:00:00Z
---

# Flujo

1. El navegador carga páginas Nuxt (`pages/`) con layout y i18n.
2. Auth: registro/login contra la tabla `users` → token Bearer HMAC → guardado en `sessionStorage` (`composables/useAuth.ts`).
3. Perfil (`/api/me`): lee y escribe `users` + `donor_profiles` en PostgreSQL.
4. Iglesias: Nitro (`GET /api/churches`) consulta Odoo IURD (`miembros.iurdsys.net`); si falla, sirve `server/data/churches.json`. El cliente usa `useChurches`. Las donaciones guardan el identificador externo.
5. Campañas y donaciones: Nitro consulta PostgreSQL mediante Drizzle. `POST /api/donations` persiste la donación y la asocia al donante si hay sesión.
6. Pie y SPEI: `GET /api/site-settings` lee `site_settings`; el admin edita en `/admin/personalizar/pie`.
7. Validación de formularios: `utils/fieldLimits.ts` en cliente y servidor (ver [/data/field-limits.md](/data/field-limits.md)).
8. Privacidad: registro y donación exigen consentimiento expreso, que Nitro valida y guarda en `consents`. El titular ejerce sus derechos ARCO desde `/perfil` (ver [/data/personal-data-inventory.md](/data/personal-data-inventory.md)).

# Componentes

| Pieza | Rol |
|-------|-----|
| `pages/` | Rutas UI: `/`, `/iglesias`, `/donaciones`, `/historial`, `/login`, `/registro`, `/perfil`, `/spei`, `/privacidad`, `/terminos`, `/admin`, `/admin/personalizar/*` |
| `utils/fieldLimits.ts` | Límites y sanitización compartidos UI + API |
| `utils/siteSettingsDefaults.ts` | Semilla de contacto y SPEI |
| `utils/legal.ts` | Identidad del responsable, versión del aviso, plazos ARCO y de conservación |
| `server/api/` | Contratos HTTP Nitro |
| `server/middleware/rateLimit.ts` | Cupo por IP en rutas sensibles |
| `server/utils/consents.ts` | Registro y consulta de consentimientos |
| `server/utils/rateLimit.ts` | Contador en memoria para el middleware |
| `server/utils/siteSettings.ts` | Lectura/escritura de `site_settings` |
| `composables/useAuth.ts` | Sesión en cliente, llamadas autenticadas; `downloadMyData`, `setConsent`, `deleteAccount` |
| `composables/useSiteSettings.ts` | Fetch de `/api/site-settings` (key `site-settings`); tras editar en admin → `refreshNuxtData` |
| `components/ConfirmDialog.vue` | Diálogo nativo `<dialog>` del sitio (guardar pie, borrar slide) |
| `server/database/schema.ts` | Definición Drizzle de las tablas |
| `server/database/migrations/` | SQL generado por `drizzle-kit` |
| `server/utils/db.ts` | Conexión perezosa y pool de PostgreSQL |
| `server/utils/users.ts` | Repositorio de cuentas y perfiles |
| `server/utils/donations.ts` | Repositorio de campañas y donaciones |
| `server/utils/auth.ts` | Hash scrypt, firmar/verificar token, `requireSession` y `optionalSession` |
| `server/utils/churches.ts` | Proxy Odoo + caché + fallback `churches.json` |
| `composables/useChurches.ts` | Fetch a `/api/churches` y caché en sessionStorage |
| `components/HeroCarousel.vue` | Fondo del home con slides y degradado |
| `components/SpeiBankDetails.vue` | CLABE, banco y concepto con botón copiar |
| `components/AdminPersonalizeNav.vue` | Subnav Carrusel / Pie bajo Personalizar |
| `components/PrivacyNoticeShort.vue` | Aviso simplificado junto a cada formulario |
| `components/LegalConsent.vue` | Casilla de consentimiento expreso, nunca premarcada |
| `pages/admin/` | Panel operativo (stats, personalizar, donaciones, usuarios) |
| `docker-compose.yml` | Servicio PostgreSQL con volumen persistente |

# Frontera de datos

La única fuente de verdad de donantes y donaciones es PostgreSQL. Las iglesias son datos externos de solo lectura. `server/data/campaigns.json` es semilla de arranque, no fuente de verdad en runtime.

# Decisiones relacionadas

Ver [decisions/](/decisions/), en particular [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md) y [/legal/](/legal/) para privacidad.
