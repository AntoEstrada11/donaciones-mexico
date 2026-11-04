---
type: Playbook
title: MinIO — almacén privado de documentos
description: Levantar MinIO, variables de entorno y checklist de seguridad (INE / CFDI).
tags: [playbook, minio, privacy, ops]
timestamp: 2026-10-08T00:00:00Z
---

# Trigger

Operar o desplegar el bucket privado para identificación oficial y futuros PDF fiscales.

# Imagen

`cleanstart/minio:latest` (API S3 compatible). La imagen histórica `minio/minio` dejó de estar
en Docker Hub público en muchos entornos.

# Local

1. `npm run db:up` (Postgres + MinIO; API en `127.0.0.1:9000`).
2. En `.env` (ver `.env.example`):

```
NUXT_MINIO_ENDPOINT=http://127.0.0.1:9000
NUXT_MINIO_ACCESS_KEY=<igual que MINIO_ROOT_USER>
NUXT_MINIO_SECRET_KEY=<igual que MINIO_ROOT_PASSWORD>
NUXT_MINIO_BUCKET_PRIVATE=donaciones-private
NUXT_MINIO_OBJECT_SECRET=<secreto largo para AES-GCM; en prod distinto del AUTH>
```

3. `npm run db:migrate` (columna `object_key`).
4. `npm run dev` — el bucket se crea solo al primer upload. Los archivos se cifran en Nitro antes de subir.

# Portainer

1. Variables: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` (largos), y las mismas en
   `NUXT_MINIO_ACCESS_KEY` / `NUXT_MINIO_SECRET_KEY`.
2. `NUXT_MINIO_ENDPOINT=http://minio:9000` (nombre del servicio en `AllanNet`).
3. **No** publicar puertos 9000/9001 ni añadir labels Traefik a `minio`.
4. Redeploy del stack. Rebuild de la imagen web si el código aún no incluye el SDK.

# Checklist de seguridad

- [ ] MinIO no tiene host público ni consola expuesta en producción.
- [ ] Credenciales distintas del default `minioadmin` / `cambia-minio-en-portainer`.
- [ ] Bucket sin política de lectura anónima.
- [ ] `NUXT_MINIO_OBJECT_SECRET` definido (cifrado AES-GCM en la app).
- [ ] Borrar cuenta en `/perfil` elimina objetos bajo `identity/{userId}/` y `cfdi/{userId}/`.
- [ ] Logs sin correo, sin rutas de objeto con PII adicional.
- [ ] Aviso integral al día (`LEGAL.noticeVersion`).

# ARCO

| Derecho | Cómo |
|---------|------|
| Acceso | `GET /api/me/export` (incluye `identityFiles` en base64) o `GET /api/me/identity-file` |
| Cancelación | `DELETE /api/me` → `purgePrivateObjectsForUser` + CASCADE en BD |
| Rectificación | Volver a subir anverso/reverso (reemplaza objeto y borra la key anterior) |

# Relacionado

[/decisions/minio-private-objects.md](/decisions/minio-private-objects.md) ·
[/playbooks/arco-request.md](/playbooks/arco-request.md)
