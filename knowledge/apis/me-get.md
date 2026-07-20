---
type: API Endpoint
title: GET /api/me
description: Devuelve el perfil del donante autenticado (Odoo o mock local).
resource: /api/me
tags: [api, profile]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** `Authorization: Bearer <token>`
- **Handler:** `server/api/me/index.get.ts`

# Respuesta

`DonorProfile` (`types/index.ts`): partner id, nombre, email, teléfono, dirección, RFC, `profileComplete`, `source` (`odoo` | `mock`).

# Errores

| Código | Causa |
|--------|--------|
| 401 | Sin token, token inválido/expirado o usuario no encontrado |
