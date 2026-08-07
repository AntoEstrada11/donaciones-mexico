---
type: API Endpoint
title: GET /api/donations
description: Historial de donaciones del donante autenticado.
resource: /api/donations
tags: [api, donations]
timestamp: 2026-08-06T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** `Authorization: Bearer <token>` (obligatorio)
- **Handler:** `server/api/donations.get.ts`
- **Repositorio:** `listDonationsByUser()` en `server/utils/donations.ts`

# Respuesta

Array de `Donation` ordenado por fecha descendente: `id`, `churchId`, `campaignId`, `amount`, `currency`, `status`, `method`, `createdAt`.

`amount` se convierte de `NUMERIC` a número en la frontera del repositorio.

# Errores

| Código | Causa |
|--------|--------|
| 401 | Sin sesión válida |

# Cambio respecto a la versión anterior

Antes devolvía un JSON estático y era público. Ahora exige sesión y devuelve únicamente las donaciones de ese donante.
