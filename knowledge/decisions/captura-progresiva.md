---
type: Decision
title: Captura progresiva y motor UMA (sin Odoo)
description: Niveles rápido / CFDI texto / umbral PLD. Sin documentos ni sync a contactos.
tags: [decision, privacy, cfdi, uma]
status: accepted
timestamp: 2026-09-08T00:00:00Z
---

# Decisión

Nivel 1: cuenta con nombre y correo (el flujo de donar sigue exigiendo sesión).
Nivel 2: casilla de factura en donar y perfil; texto CFDI 4.0 (razón social, RFC, C.P., régimen, uso). Sin PDF.
Nivel 3 documental: **no** implementado. El motor UMA solo clasifica y alerta.

No se envía nada a contactos Odoo ni al módulo de ingresos.

# Umbrales (UMA diaria 117.31 MXN, 2026)

| Código | UMA | MXN aprox. |
|--------|------|------------|
| `pld_pending` | 1,605 | 188,282 |
| `sat_report` | 3,210 | 376,565 |

Ventana: donaciones `paid` de los últimos 6 meses, por usuario y RFC si existe.

# Relacionado

[/playbooks/auth-hub.md](/playbooks/auth-hub.md)
