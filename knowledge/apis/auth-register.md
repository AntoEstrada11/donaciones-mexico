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
| `consent` | boolean | **requerido y en `true`**; consentimiento expreso para datos sensibles |
| `marketing` | boolean | opcional; consentimiento para comunicaciones |

# Respuesta

`AuthResponse`: `token`, `id` (uuid), `name`, `email`, `role`, `profileComplete`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos, correo inválido o contraseña fuera de rango |
| 409 | Correo ya registrado (restricción `users_email_key`) |
| 422 | No se aceptó el aviso de privacidad (`consent` distinto de `true`) |
| 429 | Más de 5 registros por IP en 15 minutos |

# Notas

- Inserta `users` y `donor_profiles` en una transacción.
- La unicidad la garantiza la base, no una comprobación previa en JavaScript.
- Tras crear la cuenta escribe en `consents` las filas `privacy_notice`, `sensitive_data` y, si se
  envió, `marketing`. Ver [/data/consents-table.md](/data/consents-table.md).
- El consentimiento se valida en el servidor: la casilla del cliente no es suficiente. Ver
  [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md).
- Ver [/data/field-limits.md](/data/field-limits.md) y [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md).
