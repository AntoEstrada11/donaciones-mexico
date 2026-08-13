---
type: Decision
title: Rol admin en la misma cuenta
description: Administradores son usuarios con role=admin; bootstrap por script de promoción.
tags: [decision, auth, admin]
status: accepted
timestamp: 2026-08-07T00:00:00Z
---

# Contexto

Hacía falta un panel para operar el sitio (carrusel del hero, donaciones, usuarios) sin inventar un segundo sistema de login.

# Decisión

Columna `role` en `users` (`donor` | `admin`, default `donor`). El token HMAC y `AuthResponse` incluyen `role`. Las rutas `/api/admin/**` usan `requireAdmin`.

El primer admin se crea con `npm run db:promote-admin -- <email>` (o `ADMIN_EMAIL` en `.env`). Desde el panel se puede promover o degradar a otros, sin poder quitar el rol al único admin.

# Consecuencias

- **+** Un solo flujo de login; el enlace Admin aparece solo si `role === admin`.
- **+** Auditable en BD; no depende de una lista permanente en env.
- **−** Tras promover a alguien hay que volver a iniciar sesión para refrescar el token.
- **−** Quien tenga el correo del admin puede operar el panel; la contraseña debe ser fuerte.

# Relacionado

[/playbooks/promote-admin.md](/playbooks/promote-admin.md) · [/apis/](/apis/)
