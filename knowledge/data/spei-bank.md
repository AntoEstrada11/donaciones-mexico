---
type: Reference
title: Datos bancarios SPEI
description: CLABE y beneficiario públicos para transferencia; la UI vive en /spei.
tags: [spei, bank]
timestamp: 2026-08-18T00:00:00Z
---

# Dónde están

Textos en `i18n/locales/es-MX.json` (`spei.*`). No hay tabla ni API: son datos de exhibición.

# Valores vigentes

| Campo | Valor |
|-------|-------|
| Banco | Banco Azteca |
| Beneficiario | IGLESIA UNIVERSAL DEL REINO DE DIOS OFES A.R. |
| CLABE | 127180001112050753 |
| Concepto | Donativo |

Cámbielos en el JSON de i18n (home, footer, `/spei` y confirmación de donación leen las mismas claves).

# UI

- Página: `pages/spei/index.vue`
- Bloque reutilizable: `components/SpeiBankDetails.vue`
- Enlaces: home, pie, método SPEI en `/donaciones` y pantalla de éxito SPEI

# Relacionado

[/roadmap.md](/roadmap.md) · conciliación SPEI sigue pendiente (marcar `paid` en `/admin/donations`).
