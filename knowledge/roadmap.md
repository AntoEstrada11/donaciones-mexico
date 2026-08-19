---
type: Reference
title: Roadmap
description: Hecho, en curso y fuera de alcance hasta tener pasarela o fiscal.
tags: [roadmap]
timestamp: 2026-08-18T00:00:00Z
---

# Hecho

- Sitio público: home, iglesias, donación, historial, login, registro, perfil.
- Panel `/admin` (stats, carrusel, donaciones, usuarios).
- Persistencia PostgreSQL (donantes, campañas, donaciones, slides).
- Tutorial SPEI en `/spei` (datos bancarios, pasos, copia al portapapeles).

# Pendiente de producto (sí en el plan original)

| Ítem | Bloqueo |
|------|---------|
| Donación recurrente | Hace falta cargo automático (pasarela o domiciliación). El home sigue con «Próximamente». |
| Pasarela de tarjeta | Hoy `POST /api/donations` deja `pending` sin cobro. |
| Conciliación SPEI | El admin puede marcar `paid` a mano; no hay cruce con el banco. |
| CFDI | El RFC ya se captura; no hay timbrado ni tabla de auditoría de estados. |

# Pendiente de endurecimiento

- Sesión en cookie `HttpOnly` (hoy token en `sessionStorage`).
- Límite de tasa en login y `POST /api/donations`.
- Nombre histórico de la iglesia en la donación (hoy solo `church_external_id`).

# Fuera de alcance hasta decisión

Cifrado de RFC en reposo, WAF, JWT estándar. Ver [/security/layers.md](/security/layers.md).
