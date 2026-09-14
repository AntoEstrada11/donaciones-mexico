---
type: API Endpoint
title: POST /api/auth/login
description: Autentica contra la tabla users y emite token Bearer HMAC.
resource: /api/auth/login
tags: [api, auth]
timestamp: 2026-08-07T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** ninguna
- **Handler:** `server/api/auth/login.post.ts`
- **Validación:** correo vía `utils/fieldLimits.ts`

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `email` | string | requerido; máx. 255; formato válido |
| `password` | string | requerido |

# Respuesta

`AuthResponse`: `token`, `id` (uuid), `name`, `email`, `profileComplete`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan campos o correo inválido |
| 401 | Credenciales incorrectas |
| 429 | Más de 10 intentos por IP en 5 minutos (fuerza bruta) |

# Notas

Operador vía Auth Hub primero; si no aplica, donante o admin local. Respuesta con `role` `donor` o `admin`. Ver [/decisions/donor-vs-operator-auth.md](/decisions/donor-vs-operator-auth.md).

El `sub` del token es el uuid del usuario, no el correo. Ver [/data/field-limits.md](/data/field-limits.md).
