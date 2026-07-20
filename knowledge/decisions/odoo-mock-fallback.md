---
type: Decision
title: Mock si Odoo vacío
description: Sin las cuatro vars NUXT_ODOO_*, partner id sintético y perfil source=mock.
tags: [decision, odoo, mock]
timestamp: 2026-07-20T00:00:00Z
---

# Contexto

Desarrollo y demos sin instancia Odoo disponible.

# Decisión

`isOdooConfigured()` exige URL, DB, usuario y password. Si falta alguna, `upsertOdooPartner` genera un id estable por hash de email y el perfil usa `source: 'mock'`.

# Consecuencias

- **+** `npm run dev` útil sin CRM.
- **−** Datos de perfil “ricos” no se sincronizan hasta configurar Odoo.

# Cuándo reconsiderar

Cuando staging/prod siempre tengan Odoo y el mock deba fallar en duro (fail-fast).
