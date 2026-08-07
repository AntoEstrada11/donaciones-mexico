---
type: Reference
title: Capas de seguridad
description: Controles de auth, acceso a datos y variables de entorno; solo nombres, nunca valores.
tags: [security]
timestamp: 2026-08-07T00:00:00Z
---

# Controles

| Capa | Implementación | Env (nombre) |
|------|----------------|--------------|
| Firma de sesión | HMAC-SHA256 (`data.sig`), TTL 7 días, `sub` = uuid del usuario | `NUXT_AUTH_SECRET` |
| Contraseñas | scrypt con salt por usuario, comparación en tiempo constante | — (columna `password_hash`) |
| Sesión API | Header `Authorization: Bearer` + `requireSession` / `optionalSession` | — |
| Base de datos | Usuario dedicado de aplicación, puerto publicado solo en `127.0.0.1` | `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |
| Público | URL de iglesias y coordenadas por defecto | `runtimeConfig.public.*` (sin secretos) |

# Manejo de datos personales

- Los datos de contacto y fiscales viven en `donor_profiles`, separados de la tabla de acceso.
- Borrar un donante elimina su perfil en cascada pero conserva las donaciones con `user_id` nulo.
- El RFC se almacena en claro; si se emiten CFDI conviene evaluar cifrado de columna con `pgcrypto`.

# Prohibido en este bundle

Valores de contraseñas, cadenas de conexión, tokens o llaves. Solo nombres de variables.

# Limitaciones actuales

- Token propio, no JWT estándar ni cookie `HttpOnly`; vive en `sessionStorage`.
- Rotar `NUXT_AUTH_SECRET` invalida todas las sesiones activas.
- `POST /api/donations` acepta peticiones sin sesión por diseño; no hay límite de tasa.
- El secreto por defecto en `nuxt.config.ts` (`dev-secret-change-me`) es solo para desarrollo.
- Sin cifrado en reposo más allá del que ofrezca el disco del host.
- La validación de campos (montos, RFC, etc.) mitiga basura de entrada; no sustituye rate limiting ni WAF. Ver [/data/field-limits.md](/data/field-limits.md).
