---
type: Decision
title: Auth local Option A
description: Usuarios en server/data/users.json con scrypt y token HMAC Bearer.
tags: [decision, auth]
timestamp: 2026-07-20T00:00:00Z
---

# Contexto

Se necesitaba login/registro rápido sin proveedor Auth SaaS ni usuarios Odoo.

# Decisión

Option A: archivo JSON local (`users.json`, gitignored), passwords scrypt, sesión firmada con `NUXT_AUTH_SECRET`.

# Consecuencias

- **+** Simple de operar en un solo nodo; sin dependencia externa de auth.
- **−** No escala multi-instancia sin shared storage; no es cookie HttpOnly; rotar secret invalida sesiones.

# Cuándo reconsiderar

Producción multi-réplica, requisitos de compliance, o migración a IdP (OAuth/OIDC).
