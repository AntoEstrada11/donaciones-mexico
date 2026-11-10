---
type: Decision
title: Rol admin en la misma cuenta
description: Administradores son usuarios con role=admin; personal institucional @mx.universal.org.
tags: [decision, auth, admin]
status: accepted
timestamp: 2026-08-07T00:00:00Z
---

# Contexto

Hacía falta un panel para operar el sitio (carrusel del hero, donaciones, usuarios) sin inventar un segundo sistema de login.

# Decisión

Columna `role` en `users` (`donor` | `admin` | `editor`, default `donor`). El token HMAC y `AuthResponse` incluyen `role`.

- **`admin`**: panel completo (`requireAdmin`).
- **`editor`**: solo Personalizar carrusel y pie de **contacto** (`requireContentEditor`). No puede cambiar datos SPEI (CLABE), cobros ni operación de donantes. `requireAdmin` / `requireStaff` revalidan el rol en BD (el JWT no basta tras un demote).
- **`donor`**: sitio público.

**Separación en UI:** `/admin/users` lista solo donantes. `/admin/operadores` lista admin/editor y candidatos a promover.

**Dominio institucional:** solo correos `@mx.universal.org` pueden recibir `admin` o `editor` (API y scripts; `--allow-any` solo emergencia local). El *superadmin* del Auth Hub no es un rol de esta BD: puede entrar por login de operación, pero para operar en esta app conviene promover su cuenta local.

Bootstrap CLI: `npm run db:promote-admin -- correo@mx.universal.org`. Desde el panel: Operadores → candidatos → Hacer admin / editor.

No se puede quitar el único `admin`. Tras cambiar rol hay que volver a iniciar sesión.

# Consecuencias

- **+** Un solo flujo de login; el enlace Admin aparece solo si `role === admin`.
- **+** Donantes y personal no se mezclan en el listado.
- **−** Quien tenga el correo del admin puede operar el panel; la contraseña debe ser fuerte.

# Relacionado

[/playbooks/promote-admin.md](/playbooks/promote-admin.md) · [/apis/admin.md](/apis/admin.md)
