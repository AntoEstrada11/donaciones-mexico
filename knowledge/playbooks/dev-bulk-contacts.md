---
type: Playbook
title: Carga masiva de contactos de prueba
description: POST /api/dev/contacts en nuxt dev, con JSON ficticio.
tags: [playbook, dev]
timestamp: 2026-09-10T00:00:00Z
---

# Trigger

Necesita cuentas donantes locales para probar listados, edición de perfil y admin. **Solo `npm run dev`.** No existe en Vercel.

# Steps

1. `npm run db:setup` y `npm run dev`.
2. POST a `http://localhost:3000/api/dev/contacts` con el JSON de `server/data/dev-contacts.sample.json`.
3. Entrar en `/login` con un correo `dev.contacto.NN@example.test` y la contraseña del body.
4. En `/admin/users` (cuenta operador) aparecen como donantes.

# Límites

Máximo 80 filas. Correos repetidos se omiten (`duplicate`). Datos reales no van en este archivo.

# Relacionado

[/apis/dev-contacts.md](/apis/dev-contacts.md)
