---
type: Playbook
title: Auth Hub
description: El hub autentica solo al personal del panel; los donantes se registran en este sitio.
tags: [auth, hub, ops]
timestamp: 2026-09-04T00:00:00Z
---

# Dos audiencias

| Quién | UI | API |
|-------|----|-----|
| Donante | `/registro`, Iniciar sesión | `/api/auth/register`, `/api/auth/login` (Postgres) |
| Operación | la misma Iniciar sesión | `/api/auth/login` → api-hub si no es donante |

`NUXT_PUBLIC_AUTH_HUB_URL=http://159.54.159.34:8000` (sin slash). Health `/health`. Swagger `/docs`. `NUXT_PUBLIC_APP_CODE=donaciones`. El login de operación reintenta `auth-hub` si no hay membresía en donaciones.

El Hub está en **HTTP**. Este sitio llama al Hub **desde Nitro** (no desde el navegador), así que Mixed Content de Vercel HTTPS→HTTP no aplica al login. Si más adelante el cliente habla al Hub, hará falta HTTPS en Oracle.

# Preparar operadores en web-hub

1. App con código `donaciones`.
2. Invitar el correo y membresía **admin** (u `owner`) activa, **o** marcar la cuenta como superadmin del hub.
3. Aceptar invitación y definir contraseña.

Un superadmin del hub entra con **Iniciar sesión** aunque no tenga membresía en `donaciones`. El resto del personal sí necesita esa membresía.

# Probar api-hub

1. `GET {HUB}/health`
2. `{HUB}/docs`
3. `POST {HUB}/api/v1/auth/login` con `app_code: "donaciones"`
4. `GET {HUB}/api/v1/auth/me`
5. En este sitio: **Iniciar sesión** (el panel abre solo si el hub autoriza)

Los donantes no se invitan en el hub.
