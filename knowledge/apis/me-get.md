---
type: API Endpoint
title: GET /api/me
description: Devuelve el perfil del donante autenticado desde PostgreSQL.
resource: /api/me
tags: [api, profile]
timestamp: 2026-08-06T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** `Authorization: Bearer <token>`
- **Handler:** `server/api/me/index.get.ts`
- **Repositorio:** `getDonorProfile()` en `server/utils/users.ts`

# Respuesta

`DonorProfile` (`types/index.ts`): `id`, `name`, `email`, `phone`, `street`, `city`, `state`, `zip`, `rfc`, `profileComplete`.

Resulta de un `LEFT JOIN` entre `users` y `donor_profiles`, así que un perfil ausente devuelve campos nulos en vez de fallar.

# Errores

| Código | Causa |
|--------|--------|
| 401 | Sin token, token inválido/expirado o usuario inexistente |
