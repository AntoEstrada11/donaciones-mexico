---
type: Decision
title: Donantes locales, operadores en Auth Hub
description: Registro y login de donantes son de esta app; el hub solo autentica al personal del panel /admin.
tags: [decision, auth, hub]
status: accepted
timestamp: 2026-09-04T00:00:00Z
---

# Contexto

El Auth Hub es para quien opera el sitio. Los donantes finales se dan de alta aquí para ver historial y datos ARCO. Mezclar ambos en `POST /api/auth/login` hacía pensar que registrarse exigía el hub.

# Decisión

| Audiencia | Dónde entra | API |
|-----------|-------------|-----|
| Donante | `/registro`, **Iniciar sesión** (`/login`) | `POST /api/auth/register`; `POST /api/auth/login` contra Postgres |
| Operación | la misma **Iniciar sesión** | el mismo `POST /api/auth/login` consulta Auth Hub si no es donante local |

La UI es una sola. Un donante no pasa por el hub. Un operador (superadmin o membresía admin) llega a `/admin` tras el mismo formulario. `/admin/login` redirige a `/login`.

Quién es administrador en este sitio:

1. `is_superadmin` en Auth Hub (cubre toda la plataforma, incluida donaciones).
2. Membresía **activa** en la app `donaciones` con rol `admin`, `superadmin` u `owner`.

Si el hub rechaza el login a `donaciones` por falta de membresía, este sitio reintenta con las apps de plataforma (`hub`, `web-hub`, `web-auth-hub`) y, si `/me` marca superadmin, abre el panel.

# Relacionado

[/playbooks/auth-hub.md](/playbooks/auth-hub.md) · [/apis/auth-login.md](/apis/auth-login.md)
