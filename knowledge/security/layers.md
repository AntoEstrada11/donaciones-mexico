---
type: Reference
title: Capas de seguridad
description: Controles de auth y defensa; solo nombres de variables, nunca valores.
tags: [security]
timestamp: 2026-07-20T00:00:00Z
---

# Controles

| Capa | Implementación | Env (nombre) |
|------|----------------|--------------|
| Firma de sesión | HMAC-SHA256 token (`data.sig`), TTL 7 días | `NUXT_AUTH_SECRET` |
| Contraseñas | scrypt + salt por usuario | — (en `users.json`) |
| Sesión API | Header `Authorization: Bearer` + `requireSession` | — |
| Odoo | JSON-RPC con usuario de integración | `NUXT_ODOO_URL`, `NUXT_ODOO_DB`, `NUXT_ODOO_USERNAME`, `NUXT_ODOO_PASSWORD` |
| Público | URL iglesias, coords default | `runtimeConfig.public.*` (sin secretos) |

# Prohibido en este bundle

Valores de API keys, passwords, tokens o connection strings.

# Limitaciones actuales

- Token casero (no JWT estándar / no cookies HttpOnly).
- `GET/POST /api/donations` sin exigir sesión.
- Modo mock Odoo si faltan las cuatro vars Odoo.
- Secret por defecto en código solo para desarrollo (`dev-secret-change-me`).
