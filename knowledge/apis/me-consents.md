---
type: API Endpoint
title: GET y POST /api/me/consents
description: Consulta y cambio de consentimientos del titular (oposición y revocación).
resource: /api/me/consents
tags: [api, privacy, arco, consent]
timestamp: 2026-08-19T00:00:00Z
---

# Contrato

- **Métodos:** `GET`, `POST`
- **Auth:** `Authorization: Bearer <token>`
- **Handlers:** `server/api/me/consents.get.ts`, `server/api/me/consents.post.ts`
- **Repositorio:** `server/utils/consents.ts`
- **Cliente:** `fetchConsents()` y `setConsent()` en `composables/useAuth.ts`

# GET

Devuelve la decisión vigente por tipo, es decir la fila más reciente de cada uno:

```json
{ "privacy_notice": true, "sensitive_data": true, "marketing": false }
```

# POST

| Campo | Tipo | Notas |
|-------|------|--------|
| `type` | string | Solo `marketing`. Las finalidades necesarias no se cambian aquí |
| `granted` | boolean | requerido |

Responde con el mapa actualizado, igual que `GET`.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Tipo no revocable, o `granted` que no es booleano |
| 401 | Sesión inválida |
| 429 | Límite de tasa de `/api/me` |

# Reglas

- **Append-only.** Cambiar una preferencia inserta una fila nueva; nunca se actualiza ni se borra.
- `privacy_notice` y `sensitive_data` son finalidades necesarias: retirarlas equivale a dar de baja
  la cuenta, así que se canalizan por `DELETE /api/me`.
- Negar `marketing` no puede afectar la donación ni el acceso a la cuenta.

# Relacionados

- [/data/consents-table.md](/data/consents-table.md)
- [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md)
