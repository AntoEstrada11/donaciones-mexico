---
type: API Endpoint
title: GET /api/me/export
description: Copia completa y portable de los datos del titular (derecho de acceso ARCO).
resource: /api/me/export
tags: [api, privacy, arco]
timestamp: 2026-08-19T00:00:00Z
---

# Contrato

- **Método:** `GET`
- **Auth:** `Authorization: Bearer <token>`
- **Handler:** `server/api/me/export.get.ts`
- **Cliente:** `downloadMyData()` en `composables/useAuth.ts`, botón en `/perfil`

# Respuesta

`DataExport` con `content-disposition: attachment; filename="mis-datos.json"`.

| Bloque | Contenido |
|--------|-----------|
| `exportedAt` | Fecha ISO de generación |
| `noticeVersion` | Versión del aviso vigente |
| `account` | `id`, `email`, `name`, `role`, `createdAt` |
| `profile` | `phone`, `wantsReceipt`, `street`, `city`, `state`, `zip`, `rfc` |
| `donations` | Historial completo del titular |
| `consents` | Cada consentimiento con tipo, estado, versión del aviso y fecha |

# Errores

| Código | Causa |
|--------|--------|
| 401 | Sesión inválida o ausente |
| 404 | Usuario no encontrado |
| 429 | Límite de tasa de `/api/me` |

# Reglas

- Nunca incluye `password_hash`, `phone_digits` ni `ip_hash`.
- Es la vía de autoservicio del derecho de acceso. El canal por correo sigue siendo obligatorio
  para quien no tenga cuenta: ver [/playbooks/arco-request.md](/playbooks/arco-request.md).
- Al agregar un campo de datos personales hay que incluirlo aquí, o la exportación deja de ser
  completa.
