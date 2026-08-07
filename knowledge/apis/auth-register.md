---
type: API Endpoint
title: POST /api/auth/register
description: Crea la cuenta del donante y su perfil vacío en PostgreSQL, y emite token.
resource: /api/auth/register
tags: [api, auth]
timestamp: 2026-08-07T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** ninguna
- **Handler:** `server/api/auth/register.post.ts`
- **Repositorio:** `createUser()` en `server/utils/users.ts`
- **Validación:** `utils/fieldLimits.ts`

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `email` | string | requerido; máx. 255; formato válido; minúsculas |
| `password` | string | requerido; 6–128 caracteres |
| `name` | string | opcional; máx. 160; default = parte local del email |

# Respuesta

`AuthResponse`: `token`, `id` (uuid), `name`, `email`, `profileComplete`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos, correo inválido o contraseña fuera de rango |
| 409 | Correo ya registrado (restricción `users_email_key`) |

# Notas

- Inserta `users` y `donor_profiles` en una transacción.
- La unicidad la garantiza la base, no una comprobación previa en JavaScript.
- Ver [/data/field-limits.md](/data/field-limits.md) y [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md).
