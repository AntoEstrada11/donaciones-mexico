---
type: API Endpoint
title: PATCH /api/me
description: Actualiza nombre y datos personales/fiscales del donante en PostgreSQL.
resource: /api/me
tags: [api, profile]
timestamp: 2026-08-07T00:00:00Z
---

# Contrato

- **Método:** `PATCH`
- **Auth:** `Authorization: Bearer <token>`
- **Handler:** `server/api/me/index.patch.ts`
- **Repositorio:** `updateDonorProfile()` en `server/utils/users.ts`
- **Validación:** `utils/fieldLimits.ts`

# Body (parcial)

Campos opcionales: `name`, `phone`, `street`, `city`, `state`, `zip`, `rfc`.
Solo se tocan los campos presentes en el body; `name` no puede quedar vacío si se envía.

# Respuesta

`DonorProfile` actualizado.

# Reglas

- Teléfono: normalizado a `phone_digits` (índice único). Si se envía, 10–15 dígitos.
- C.P.: si se envía, exactamente 5 dígitos.
- RFC: si se envía, 12 o 13 caracteres con patrón SAT básico; mayúsculas.
- Nombre máx. 160; dirección 200; ciudad/estado 120.
- `profileComplete` = nombre + teléfono presentes.
- Escribe `users` y `donor_profiles` en una transacción.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Nombre, teléfono, C.P. o RFC fuera de formato |
| 401 | Sesión inválida |
| 404 | Usuario no encontrado |
| 409 | Teléfono ya registrado por otro donante |

Detalle de límites: [/data/field-limits.md](/data/field-limits.md).
