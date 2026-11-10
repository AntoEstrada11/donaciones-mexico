---
type: Decision
title: MinIO para documentos privados (INE y futuros CFDI)
description: Bucket privado S3-compatible, sin URL pública; Nitro como único proxy autenticado.
tags: [decision, privacy, storage, minio, lfpdppp]
timestamp: 2026-10-08T00:00:00Z
---

# Contexto

Las fotos de INE vivían como BYTEA en PostgreSQL. Eso escala mal y mezcla metadatos con binarios
sensibles. Habrá PDF de CFDI. Hacía falta un almacén de objetos con control estricto de acceso.

# Decisión

Usar **MinIO** (API S3) en el mismo stack Docker (`AllanNet`), con:

- Un bucket privado `donaciones-private` (nombre configurable).
- Prefijos `identity/{userId}/` y `cfdi/{userId}/`.
- Cifrado **en la aplicación** (AES-256-GCM) antes de subir; MinIO solo guarda ciphertext.
  Clave: `NUXT_MINIO_OBJECT_SECRET` o, si falta, `NUXT_AUTH_SECRET`.
- **Sin puertos publicados en Portainer** y sin router Traefik hacia MinIO.
- En local, solo `127.0.0.1:9000` (override).
- Consola de MinIO apagada en servidor (`MINIO_BROWSER=off`).
- Lectura/escritura solo desde Nitro con credenciales de servidor.
- Entrega al titular únicamente vía `GET /api/me/identity-file` (sesión) o el JSON de
  `GET /api/me/export` (base64). Nunca URLs firmadas de larga vida ni objetos públicos.
- Cancelación ARCO: `purgePrivateObjectsForUser` antes de borrar `users`.

# Alternativas descartadas

| Opción | Por qué no |
|--------|------------|
| Seguir en BYTEA | Infla la base; respaldos pesados; sin ciclo de vida de objetos |
| Disco bajo `public/` | Accesible por HTTP estático |
| URLs prefirmadas largas | Riesgo de filtración por enlace |
| Bucket público + “ocultar” la key | Security through obscurity; no cumple minimización de acceso |

# Consecuencias

- Subir INE exige MinIO configurado (`NUXT_MINIO_*`); si falta → 503.
- Hay que rotar `MINIO_ROOT_PASSWORD` / `NUXT_MINIO_SECRET_KEY` en Portainer.
- El aviso de privacidad declara el almacén privado (`LEGAL.noticeVersion` 2026-10-08).
- Filas legadas con `bytes` siguen sirviéndose hasta re-subir o migrar.

# Relacionado

[/playbooks/minio-private-storage.md](/playbooks/minio-private-storage.md) ·
[/security/data-retention.md](/security/data-retention.md) ·
[/data/personal-data-inventory.md](/data/personal-data-inventory.md)
