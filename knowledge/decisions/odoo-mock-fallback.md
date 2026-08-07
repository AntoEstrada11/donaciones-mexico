---
type: Decision
title: Mock si Odoo vacío
description: Sin las cuatro vars NUXT_ODOO_*, se generaba un partner id sintético. Superada.
tags: [decision, odoo, mock, superseded]
status: superseded
superseded_by: /decisions/postgres-datos-propios.md
timestamp: 2026-08-06T00:00:00Z
---

> **Superada el 2026-08-06.** Ya no existe integración con Odoo ni modo mock. Ver [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md).

# Contexto

Desarrollo y demos sin instancia de Odoo disponible.

# Decisión

`isOdooConfigured()` exigía URL, base, usuario y contraseña. Si faltaba alguna, `upsertOdooPartner` generaba un id estable por hash del correo y el perfil se marcaba `source: 'mock'`.

# Consecuencias

- **+** `npm run dev` era útil sin CRM.
- **−** Los datos de perfil no se sincronizaban hasta configurar Odoo.

# Por qué se abandonó

Además de la salida de Odoo, el mecanismo tenía una trampa práctica: copiar `.env.example` dejaba las variables con valores de ejemplo (`https://tu-odoo.ejemplo.com`), lo que hacía creer al sistema que Odoo estaba configurado y rompía el registro con un error de TLS. Una condición basada en "las variables tienen algo escrito" no distingue configuración real de plantilla.
