---
type: Playbook
title: Desplegar
description: Build de producción Nuxt/Nitro y verificación básica.
tags: [deploy]
timestamp: 2026-07-20T00:00:00Z
---

# Trigger

Publicar o actualizar el entorno de staging/producción.

# Steps

1. Definir en el host las env: `NUXT_AUTH_SECRET` y, si aplica, las cuatro `NUXT_ODOO_*`.
2. `npm ci` (o `npm install`).
3. `npm run build`.
4. Arrancar el output Nitro del host (típico: `node .output/server/index.mjs`) o el adaptador del proveedor.
5. Smoke: login/registro, `/api/campaigns`, `/iglesias`, crear donación en `/donaciones`.

# Notas

- Asegurar volumen/escritura para `server/data/users.json` si el filesystem del host es efímero.
- No commitear `.env` ni `users.json`.
- Pasarelas de pago reales aún no están en el alcance.
