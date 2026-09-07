---
type: Playbook
title: Rotar secretos de pasarela
description: Cómo rotar tokens y webhook secrets sin dejar el cobro caído.
tags: [playbook, payments, security]
timestamp: 2026-09-07T00:00:00Z
---

# Reglas

- Nunca pegar secretos en chat, tickets, OKF ni logs.
- Rotar en **test** primero si el incidente no es producción.
- Tras rotar el secreto de webhook, actualizar el valor en el panel del proveedor **y** en el host en el mismo cambio.

# Procedimiento

1. Generar nuevo token / secret / webhook id en el panel del proveedor.
2. Actualizar las variables `NUXT_*` correspondientes en el host (ambos modos si aplica).
3. Reiniciar Nitro / redeploy para cargar env.
4. En admin: «Probar conexión» (cuando exista) y un cobro sandbox.
5. Revocar el secreto viejo en el panel del proveedor.
6. Anotar en el runbook operativo (fuera de `knowledge/`) la fecha de rotación, **sin** el valor.

# Si se filtró un secreto

1. Rotar de inmediato (pasos arriba).
2. Revisar `payment_events` y donaciones recientes por anomalías.
3. Seguir [/playbooks/data-breach.md](/playbooks/data-breach.md) si hay indicios de acceso indebido a datos personales.
