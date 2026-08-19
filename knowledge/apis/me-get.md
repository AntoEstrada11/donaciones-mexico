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

`DonorProfile` (`types/index.ts`): `id`, `name`, `email`, `phone`, `wantsReceipt`, `street`, `city`, `state`, `zip`, `rfc`, `profileComplete`.

Los campos fiscales pueden ser `null` si el donante no activó recibo deducible. Ver [/decisions/minimizacion-datos-fiscales.md](/decisions/minimizacion-datos-fiscales.md).

# Errores

| Código | Causa |
|--------|--------|
| 401 | Sin token, token inválido/expirado o usuario inexistente |

# Relacionados

- Rectificación: [PATCH /api/me](me-patch.md)
- Acceso portable: [GET /api/me/export](me-export.md)
