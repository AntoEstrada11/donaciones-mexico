---
type: Playbook
title: Cambiar contraseña de un usuario
description: Actualizar el hash scrypt de una cuenta por correo, o crear el primer admin si no existe.
tags: [auth, db, admin]
timestamp: 2026-08-18T00:00:00Z
---

# Trigger

Olvidaste la contraseña del admin, o hay que fijar una nueva sin pasar por la UI (no hay cambio de contraseña en `/perfil`).

# Steps

1. Base levantada (`docker compose up -d`).
2. En una sola línea, sin guardar la clave en `.env`:

```bash
NEW_PASSWORD='su-clave-nueva' npm run db:set-password -- correo@ejemplo.com
```

3. Si el correo no existe y quieres el primer admin:

```bash
NEW_PASSWORD='su-clave-nueva' npm run db:set-password -- correo@ejemplo.com --create
```

4. Alternativa de correo: `ADMIN_EMAIL` en `.env` y omitir el argumento.
5. Cierra sesión en el navegador e inicia sesión de nuevo.

# Verificación

```sql
SELECT email, role, updated_at FROM users WHERE email = 'correo@ejemplo.com';
```

El login en `/login` debe aceptar la clave nueva. El hash (`password_hash`) cambia; el valor en claro no se guarda.

# Notas

- La clave debe tener entre 6 y 128 caracteres (mismos límites que el registro).
- El script usa scrypt con salt nuevo, igual que `POST /api/auth/register`.
- `--create` da de alta `users` + `donor_profiles` con `role=admin` y nombre `Administrador`.
- No commitear `NEW_PASSWORD` ni dejarla en el historial del shell si el entorno es compartido.
- Relacionado: [/playbooks/promote-admin.md](/playbooks/promote-admin.md).
