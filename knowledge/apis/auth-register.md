---
type: API Endpoint
title: POST /api/auth/register
description: Registra donante local, upsert de res.partner en Odoo (o mock) y emite token.
resource: /api/auth/register
tags: [api, auth]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** ninguna
- **Handler:** `server/api/auth/register.post.ts`

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `email` | string | requerido, normalizado a minúsculas |
| `password` | string | requerido, mín. 6 caracteres |
| `name` | string | opcional; default = parte local del email |

# Respuesta

`AuthResponse`: `token`, `name`, `email`, `odooPartnerId`, `profileComplete`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos, email inválido o password corta |
| 409 | Correo ya registrado |
| 502 | Fallo JSON-RPC Odoo (si está configurado) |

# Notas

- Id de usuario de la app = email (no se crea `res.users` en Odoo).
- Ver [/decisions/odoo-partner-not-user.md](/decisions/odoo-partner-not-user.md).
