---
type: Reference
title: Roadmap
description: Hecho, en curso y fuera de alcance hasta tener pasarela o fiscal.
tags: [roadmap]
timestamp: 2026-08-19T00:00:00Z
---

# Hecho

- Sitio público: home, iglesias, donación, historial, login, registro, perfil.
- Panel `/admin` (stats, carrusel, donaciones, usuarios).
- Persistencia PostgreSQL (donantes, campañas, donaciones, slides, consentimientos).
- Tutorial SPEI en `/spei` (datos bancarios, pasos, copia al portapapeles).
- **Cumplimiento LFPDPPP:** aviso integral (`/privacidad`), términos (`/terminos`), aviso simplificado en formularios, tabla `consents`, ARCO en `/perfil`, datos fiscales bajo demanda (`wants_receipt`), geolocalización opt-in en iglesias, rate limiting en auth/donaciones. Ver [/legal/](/legal/).
- Límite de tasa por IP en login, registro, donaciones y escrituras de `/api/me`.

# Pendiente de producto (sí en el plan original)

| Ítem | Bloqueo |
|------|---------|
| Donación recurrente | Hace falta cargo automático (pasarela o domiciliación). El home sigue con «Próximamente». |
| Pasarela de tarjeta | Hoy `POST /api/donations` deja `pending` sin cobro. |
| Conciliación SPEI | El admin puede marcar `paid` a mano; no hay cruce con el banco. |
| CFDI | El RFC y domicilio se capturan solo si el donante activa recibo deducible; no hay timbrado ni bloqueo por obligación fiscal de 5 años. |

# Pendiente jurídico / operativo (privacidad)

| Ítem | Nota |
|------|------|
| Confirmar `LEGAL.domicilio` | Marcador en `utils/legal.ts`; requisito del aviso |
| Confirmar buzón ARCO dedicado | Hoy `donaciones@mx.universal.org` |
| Revisión jurídica del aviso | Borrador técnico alineado a la ley, no asesoría legal |
| Rate limit multi-instancia | Store compartido si hay varias réplicas de Nitro |

# Pendiente de endurecimiento

- Sesión en cookie `HttpOnly` (hoy token en `sessionStorage`).
- Nombre histórico de la iglesia en la donación (hoy solo `church_external_id`).

# Fuera de alcance hasta decisión

Cifrado de RFC en reposo, WAF, JWT estándar. Ver [/security/layers.md](/security/layers.md).
