---
type: API Endpoint
title: DELETE /api/me
description: Baja de cuenta del titular (derecho de cancelación ARCO), con confirmación por contraseña.
resource: /api/me
tags: [api, privacy, arco]
timestamp: 2026-08-19T00:00:00Z
---

# Contrato

- **Método:** `DELETE`
- **Auth:** `Authorization: Bearer <token>`
- **Handler:** `server/api/me/index.delete.ts`
- **Repositorio:** `deleteUserAccount()` en `server/utils/users.ts`
- **Cliente:** `deleteAccount()` en `composables/useAuth.ts`, sección de privacidad en `/perfil`

# Body

| Campo | Tipo | Notas |
|-------|------|--------|
| `password` | string | requerido; se revalida contra el hash de la cuenta |

# Respuesta

`{ "deleted": true }`. El cliente cierra sesión y redirige al inicio.

# Errores

| Código | Causa |
|--------|--------|
| 400 | Falta la contraseña |
| 401 | Sesión inválida o contraseña incorrecta |
| 404 | Usuario no encontrado |
| 409 | Es la única cuenta de administrador |
| 429 | Límite de tasa de `/api/me` |

# Efecto en la base

| Tabla | Resultado |
|-------|-----------|
| `users` | Se elimina la fila |
| `donor_profiles` | `CASCADE`: teléfono, domicilio y RFC desaparecen |
| `donations` | `SET NULL`: la donación queda sin titular, se conserva por obligación contable |
| `consents` | `SET NULL`: la evidencia sobrevive anonimizada |

# Reglas

- Pide la contraseña aunque haya sesión válida, para que un token robado no pueda borrar la cuenta.
- Antes de eliminar inserta tres filas de revocación en `consents`, de modo que quede constancia de
  que el titular retiró su consentimiento.
- Cuando el sitio emita CFDI, el respaldo contable no podrá eliminarse antes de 5 años. Ver
  [/security/data-retention.md](/security/data-retention.md).
