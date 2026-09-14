---
type: API Endpoint
title: POST /api/dev/contacts
description: Alta masiva de donantes ficticios. Solo existe en `nuxt dev`.
resource: /api/dev/contacts
tags: [api, dev, donors]
timestamp: 2026-09-10T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** ninguna (solo proceso de desarrollo local)
- **Handler:** `server/api/dev/contacts.post.ts`
- **Disponible:** únicamente `import.meta.dev` (`npm run dev`). En preview/producción responde `404`.
- **Tope:** 80 contactos por petición.

No usar datos de personas reales. Correos de ejemplo: `@example.test`.

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `password` | string | Contraseña común para iniciar sesión en local (6–128) |
| `contacts` | array | Cada ítem: `email`, `name`; opcionales teléfono y CFDI |

# Respuesta

`{ created, skipped, contacts: [{ id, email }], errors: [{ index, reason }] }`

`reason`: `invalid` o `duplicate`.

# Relacionado

[/playbooks/dev-bulk-contacts.md](/playbooks/dev-bulk-contacts.md)
