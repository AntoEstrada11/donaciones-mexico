---
type: Reference
title: Límite de tasa por IP
description: Cupos en memoria para login, registro, donaciones y escrituras de perfil.
resource: server/middleware/rateLimit.ts
tags: [security, privacy, api]
timestamp: 2026-08-19T00:00:00Z
---

# Propósito

Medida técnica razonable contra fuerza bruta y abuso de endpoints que reciben datos personales o
proxyean servicios externos (Odoo). Complementa la validación de `fieldLimits.ts`; no sustituye WAF
ni store compartido entre réplicas.

# Implementación

| Pieza | Rol |
|-------|-----|
| `server/utils/rateLimit.ts` | Contador en memoria por clave (`prefix:ip`) |
| `server/middleware/rateLimit.ts` | Aplica reglas antes de los handlers |

Respuesta al exceder cupo: `429` con header `Retry-After` (segundos).

# Reglas vigentes

| Prefijo de ruta | Límite | Ventana | Métodos |
|-----------------|--------|---------|---------|
| `/api/auth/login` | 10 | 5 min | todos |
| `/api/auth/admin-login` | 10 | 5 min | todos |
| `/api/auth/register` | 5 | 15 min | todos |
| `/api/donations` | 20 | 5 min | todos |
| `/api/me` | 60 | 5 min | POST, PATCH, DELETE (GET excluido) |
| `/api/churches` | 60 | 5 min | GET |
| `/api/payments/checkout` | 20 | 5 min | POST |
| `/api/payments/paypal/capture` | 20 | 5 min | POST |
| `/api/payments/mercadopago/sync` | 20 | 5 min | POST |
| `/api/dev/contacts` | 20 | 5 min | POST (`nuxt dev`) |

La IP se obtiene con `getRequestIP(event, { xForwardedFor: true })`. Detrás de un proxy inverso
confiable debe configurarse el encabezado `X-Forwarded-For` correctamente.

# Limitaciones

- **Por proceso:** cada instancia de Nitro tiene su propio mapa; con varias réplicas el cupo
  efectivo se multiplica.
- **Por IP:** usuarios detrás del mismo NAT comparten cupo.
- **Sin persistencia:** reiniciar el servidor resetea contadores.
- **Sin bloqueo de cuenta:** solo ralentiza peticiones; no sustituye políticas de contraseña.

En despliegues multi-instancia conviene Redis o equivalente (fuera de alcance actual).

# Relacionados

- [/security/layers.md](/security/layers.md)
- [/apis/auth-login.md](/apis/auth-login.md)
- [/apis/auth-register.md](/apis/auth-register.md)
