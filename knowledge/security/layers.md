---
type: Reference
title: Capas de seguridad
description: Controles de auth, acceso a datos y variables de entorno; solo nombres, nunca valores.
tags: [security]
timestamp: 2026-08-18T00:00:00Z
---

# Controles

| Capa | Implementación | Env (nombre) |
|------|----------------|--------------|
| Firma de sesión | HMAC-SHA256 (`data.sig`), TTL 7 días, `sub` = uuid del usuario | `NUXT_AUTH_SECRET` |
| Contraseñas | scrypt con salt por usuario, comparación en tiempo constante | — (columna `password_hash`) |
| Sesión API | Header `Authorization: Bearer` + `requireSession` / `optionalSession` | — |
| Base de datos | Usuario dedicado de aplicación, puerto publicado solo en `127.0.0.1` | `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |
| Público | Coordenadas por defecto del directorio | `runtimeConfig.public.defaultLatitude` / `defaultLongitude` |
| Iglesias (servidor) | Odoo IURD; URL pública, key solo servidor | `NUXT_CHURCHES_API_URL`, `NUXT_CHURCHES_API_KEY`, `NUXT_CHURCHES_API_ALLOWED_HOST` |
| Límite de tasa | En memoria por IP y ruta (`server/middleware/rateLimit.ts`) | — |

Detalle de cupos, ventanas y limitaciones multi-instancia: [/security/rate-limiting.md](/security/rate-limiting.md).

# Límites de tasa

| Ruta | Cupo |
|------|------|
| `POST /api/auth/login` | 10 por IP cada 5 min |
| `POST /api/auth/register` | 5 por IP cada 15 min |
| `POST /api/donations` | 20 por IP cada 5 min |
| `/api/me` (escrituras) | 60 por IP cada 5 min |
| `GET /api/churches` | 60 por IP cada 5 min |

El contador vive en memoria del proceso. Con varias instancias hay que moverlo a un store compartido o quedará repartido entre réplicas.

# Manejo de datos personales

- Este sitio trata **datos sensibles**: el donativo revela creencias religiosas. Las sanciones se duplican. Ver [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md).
- Los datos de contacto y fiscales viven en `donor_profiles`, separados de la tabla de acceso.
- Los datos fiscales solo se recaban si el donante pide recibo deducible, y se borran si lo desactiva.
- Borrar un donante elimina su perfil en cascada, conserva las donaciones con `user_id` nulo y deja los consentimientos anonimizados como evidencia.
- La IP asociada a un consentimiento se guarda como HMAC, nunca en claro.
- Nunca se registran datos personales en logs. Regla operativa: `.cursor/rules/pii-handling.mdc`.
- El RFC se almacena en claro; si se emiten CFDI conviene evaluar cifrado de columna con `pgcrypto`.
- Plazos de conservación: [/security/data-retention.md](/security/data-retention.md). Inventario completo: [/data/personal-data-inventory.md](/data/personal-data-inventory.md).

# Prohibido en este bundle

Valores de contraseñas, cadenas de conexión, tokens o llaves. Solo nombres de variables.

# Limitaciones actuales

- Token propio, no JWT estándar ni cookie `HttpOnly`; vive en `sessionStorage`.
- Rotar `NUXT_AUTH_SECRET` invalida todas las sesiones activas y hace que los `ip_hash` viejos dejen de ser comparables con los nuevos.
- `POST /api/donations` acepta peticiones sin sesión por diseño, pero exige consentimiento expreso.
- El límite de tasa es por proceso y por IP: no protege contra abuso distribuido ni sustituye un WAF.
- El secreto por defecto en `nuxt.config.ts` (`dev-secret-change-me`) es solo para desarrollo.
- Sin cifrado en reposo más allá del que ofrezca el disco del host.
- La validación de campos (montos, RFC, etc.) mitiga basura de entrada; no sustituye rate limiting ni WAF. Ver [/data/field-limits.md](/data/field-limits.md).
