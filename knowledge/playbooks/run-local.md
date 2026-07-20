---
type: Playbook
title: Correr en local
description: Pasos para levantar Donaciones México en desarrollo.
tags: [dev, local]
timestamp: 2026-07-20T00:00:00Z
---

# Trigger

Necesitas desarrollar o depurar en la máquina local.

# Steps

1. Requisitos: Node.js 18+ y npm.
2. En la raíz del repo: `npm install`.
3. Copiar `.env.example` → `.env` y ajustar (mínimo `NUXT_AUTH_SECRET`). Dejar Odoo vacío para modo mock.
4. `npm run dev`.
5. Abrir [http://localhost:3000](http://localhost:3000).

# Verificación rápida

- Home carga campañas desde `/api/campaigns`.
- Registro/login crea o usa `server/data/users.json`.
- `/iglesias` consulta la API WordPress (red requerida).
