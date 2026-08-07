---
type: Decision
title: Partner Odoo, no usuario
description: El donante era res.partner en Odoo y el id de la app era el email. Superada.
tags: [decision, odoo, auth, superseded]
status: superseded
superseded_by: /decisions/postgres-datos-propios.md
timestamp: 2026-08-06T00:00:00Z
---

> **Superada el 2026-08-06.** Los datos de donantes ya no viven en Odoo. Ver [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md). Se conserva como registro histórico.

# Contexto

Hacía falta vincular donantes con el CRM sin abrir acceso a Odoo a cada fiel.

# Decisión

Al registrar, hacer upsert de `res.partner` por email. Nunca crear `res.users`. El identificador de la app era el correo.

# Consecuencias

- **+** Menor superficie de seguridad en Odoo; contacto usable para cobranza y CRM.
- **−** El login no dependía de Odoo, así que había que mantener un store local aparte.

# Por qué se abandonó

Decisión interna de no alojar datos de usuarios en Odoo. Además, usar el correo como identificador impedía que un donante lo cambiara sin arrastrar su historial, y la llamada síncrona a Odoo durante el registro era un punto de falla: con la instancia inaccesible, el alta fallaba por completo.
