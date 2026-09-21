---
type: API Endpoint
title: Identidad INE del donante
description: Alta y consulta de anverso/reverso; bytes no salen en JSON de perfil.
resource: /api/me/identity
tags: [api, privacy]
timestamp: 2026-09-14T00:00:00Z
---

# Contratos

| Método | Ruta | Nota |
|--------|------|------|
| GET | `/api/me/identity` | `{ front, back, complete }` |
| POST | `/api/me/identity` | multipart `side`, `file`, `consent=true` |
| GET | `/api/me/identity-file?side=front\|back` | bytes; derecho de acceso |

Consentimiento `identity_document` en `consents`. JPG/PNG/WebP, máx. 3 MB. Al completar ambos lados se llena `donor_profiles.identity_verified_at`.
