---
type: Playbook
title: Correo transaccional (SMTP)
description: Verificar cuenta, olvidé contraseña y reset desde admin.
tags: [playbook, email, auth]
timestamp: 2026-10-23T00:00:00Z
---

# Trigger

Enviar correos de confirmación de cuenta y restablecimiento de contraseña.

# Variables

Ver `.env.example`: `NUXT_SMTP_*`. `NUXT_MAIL_DEV_RETURN_LINK=true` en local para recibir el enlace en la API si no hay SMTP.

# Flujos

| Flujo | Endpoint / UI |
|-------|----------------|
| Registro | `POST /api/auth/register` → mail + opcional `verifyUrl` en dev |
| Confirmar | `/verificar-correo?token=` → `POST /api/auth/verify-email` |
| Reenviar | Banner o `POST /api/auth/resend-verification` |
| Olvidé contraseña | `/olvidar-contrasena` → `POST /api/auth/forgot-password` |
| Admin reset | `POST /api/admin/users/:id/password-reset` (envía mail si hay SMTP) |
| Solicitud cumplimiento | Desde ficha `/admin/donantes/:id` → `POST /api/admin/donors/:id/requests` (`identity` / `fiscal` / `email_verify`) |

Sin correo verificado el donante no puede `POST /api/donations` ni planes recurrentes. Las solicitudes abiertas aparecen en `/perfil` (`GET /api/me/requests`).

# Seguridad / privacidad

- No registrar en logs el destinatario ni el token.
- Forgot-password siempre responde igual (anti-enumeración).
- Tokens hasheados en BD; un solo uso.

# Relacionado

[/apis/me-identity.md](/apis/me-identity.md) · aviso `LEGAL.noticeVersion` 2026-10-23
