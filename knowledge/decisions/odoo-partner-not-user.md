---
type: Decision
title: Partner Odoo, no usuario
description: El donante es res.partner en Odoo; el id de la app es el email.
tags: [decision, odoo, auth]
timestamp: 2026-07-20T00:00:00Z
---

# Contexto

Hacía falta vincular donantes con CRM sin abrir acceso a Odoo a cada fiel.

# Decisión

Al registrar, hacer upsert de `res.partner` por email. Nunca crear `res.users`. El identificador de la app es el correo.

# Consecuencias

- **+** Menor superficie de seguridad en Odoo; contacto usable para cobranza/CRM.
- **−** Login no depende de Odoo; hay que mantener store local aparte.

# Cuándo reconsiderar

Si se exige SSO Odoo o un portal portal de Odoo para donantes.
