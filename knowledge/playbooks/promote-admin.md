---
type: Playbook
title: Promover administrador
description: Asignar rol admin a un correo institucional @mx.universal.org.
tags: [admin, auth, db]
timestamp: 2026-08-07T00:00:00Z
---

# Trigger

Necesitas el primer admin, o recuperar acceso al panel sin pasar por la UI.

# Steps

1. Asegúrate de que el usuario ya existe (registro) con correo `@mx.universal.org`.
2. Con la base levantada:

```bash
npm run db:promote-admin -- correo@mx.universal.org
```

3. Alternativa: define `ADMIN_EMAIL` en `.env` y ejecuta `npm run db:promote-admin` sin argumentos.
4. Desde el panel (si ya hay un admin): `/admin/operadores` → candidatos → **Hacer admin**.
5. Cierra sesión e inicia de nuevo (el token debe incluir `role: admin`).

Emergencia local (correo no institucional): `npm run db:promote-admin -- correo@ejemplo.com --allow-any`.

# Verificación

```sql
SELECT email, role FROM users WHERE email = 'correo@mx.universal.org';
```

# Notas

No se puede degradar al único admin. Ver [/decisions/admin-role.md](/decisions/admin-role.md).

Contraseña: [/playbooks/set-password.md](/playbooks/set-password.md).
