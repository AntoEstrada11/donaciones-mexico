---
type: API Endpoint
title: POST /api/auth/login
description: Autentica contra store local y emite token Bearer HMAC.
resource: /api/auth/login
tags: [api, auth]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **Método:** `POST`
- **Auth:** ninguna
- **Handler:** `server/api/auth/login.post.ts`

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `email` | string | requerido |
| `password` | string | requerido |

# Respuesta

`AuthResponse`: `token`, `name`, `email`, `odooPartnerId`, `profileComplete`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Faltan correo o contraseña |
| 401 | Credenciales incorrectas |
