---
type: API Endpoint
title: PATCH /api/me
description: Actualiza perfil local y escribe res.partner en Odoo si está configurado.
resource: /api/me
tags: [api, profile]
timestamp: 2026-07-20T00:00:00Z
---

# Contrato

- **Método:** `PATCH`
- **Auth:** `Authorization: Bearer <token>`
- **Handler:** `server/api/me/index.patch.ts`

# Body (parcial)

Campos opcionales: `name`, `phone`, `street`, `city`, `state`, `zip`, `rfc`.  
`name` no puede quedar vacío si se envía.

# Respuesta

`DonorProfile` actualizado.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Nombre vacío |
| 401 | Sesión inválida / usuario ausente |
| 409 | Teléfono ya registrado en otro usuario |
| 502 | Error Odoo (si aplica) |
