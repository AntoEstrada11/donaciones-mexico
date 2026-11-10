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

UI: captura solo con cámara en vivo (`IdentityCameraCapture`, getUserMedia + canvas); no hay `<input type="file">` de galería.

Binario en MinIO (bucket privado); la fila guarda `object_key`. `identity-file` y `export` exigen sesión del titular. Ver [/decisions/minio-private-objects.md](/decisions/minio-private-objects.md).
