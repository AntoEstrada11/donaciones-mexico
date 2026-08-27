---
type: Reference
title: Datos bancarios SPEI y contacto del pie
description: CLABE, beneficiario y teléfono/correo públicos viven en site_settings.
tags: [spei, bank, footer]
timestamp: 2026-08-27T00:00:00Z
---

# Dónde están

Tabla PostgreSQL `site_settings` (una fila, `id = 1`). Expuestos por `GET /api/site-settings`. El admin los edita en `/admin/personalizar/pie`.

Etiquetas de UI (“Contacto”, “CLABE”, “Copiar”) siguen en `i18n/locales/es-MX.json`.

# Campos

| Campo | Columna | Uso |
|-------|--------|-----|
| Teléfono | `contact_phone` | Pie |
| Correo | `contact_email` | Pie |
| Banco | `spei_bank` | Pie, `/spei` |
| Beneficiario | `spei_beneficiary` | Pie, `/spei` |
| CLABE | `spei_clabe` | 18 dígitos |
| Concepto | `spei_concept` | Transferencia |

Semilla: `utils/siteSettingsDefaults.ts` (también `npm run db:seed`).

# UI

- Admin: `/admin/personalizar/pie` (confirmación de publicación con `ConfirmDialog`)
- Público: `AppFooter`, `SpeiBankDetails`, `/spei` (`useSiteSettings`)
- Carrusel hermano: `/admin/personalizar/carrusel` (confirmación de borrado con el mismo diálogo)
- Tras PATCH exitoso: `refreshNuxtData('site-settings')`

# Relacionado

[/apis/site-settings-get.md](/apis/site-settings-get.md) · [/data/postgres-schema.md](/data/postgres-schema.md)
