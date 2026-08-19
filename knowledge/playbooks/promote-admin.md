---
type: Playbook
title: Promover administrador
description: Asignar rol admin a un usuario existente por correo.
tags: [admin, auth, db]
timestamp: 2026-08-07T00:00:00Z
---

# Trigger

Necesitas el primer admin, o recuperar acceso al panel sin pasar por la UI.

# Steps

1. Asegúrate de que el usuario ya existe (registro o migración previa).
2. Con la base levantada:

```bash
npm run db:promote-admin -- correo@ejemplo.com
```

3. Alternativa: define `ADMIN_EMAIL` en `.env` y ejecuta `npm run db:promote-admin` sin argumentos.
4. Cierra sesión en el navegador e inicia sesión de nuevo con ese correo (el token debe incluir `role: admin`).
5. Debe aparecer el enlace **Admin** en la barra y abrir `/admin`.

# Verificación

```sql
SELECT email, role FROM users WHERE email = 'correo@ejemplo.com';
```

# Notas

No se puede degradar al único admin desde la API. Ver [/decisions/admin-role.md](/decisions/admin-role.md).

Para cambiar la contraseña (no hay pantalla en `/perfil`): [/playbooks/set-password.md](/playbooks/set-password.md).
