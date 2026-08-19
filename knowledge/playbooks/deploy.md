---
type: Playbook
title: Desplegar
description: Build de producción Nuxt/Nitro con la base PostgreSQL en el mismo host.
tags: [deploy]
timestamp: 2026-08-18T00:00:00Z
---

# Trigger

Publicar o actualizar el entorno de staging/producción.

# Steps

1. Definir las variables de entorno del host: `NUXT_AUTH_SECRET` (uno largo y propio del entorno) y `DATABASE_URL`, más `POSTGRES_*` si la base corre con el compose del repo.
2. Levantar o confirmar la base: `docker compose up -d`
3. `npm ci`
4. `npm run db:migrate` — antes de publicar el código nuevo.
5. `npm run build`
6. Arrancar el output de Nitro: `node .output/server/index.mjs`, o el adaptador del proveedor.
7. Smoke: registro, login, `/api/campaigns`, `/iglesias`, alta de donación y `/historial`.
8. Carrusel: si el entorno es nuevo o se recreó la base, **no** basta con copiar `public/uploads/hero/`. Subir de nuevo las fotos en `/admin/slides`. Ver [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md).

# Orden importa

Las migraciones van antes de publicar el código: el binario nuevo espera tablas nuevas. Si una migración es destructiva, respaldar primero (ver [/playbooks/db-backup.md](/playbooks/db-backup.md)).

# Checklist de seguridad

- `NUXT_AUTH_SECRET` distinto al de desarrollo. Cambiarlo cierra todas las sesiones abiertas.
- Puerto 5432 publicado solo en `127.0.0.1`, nunca hacia Internet.
- Usuario de base dedicado a la aplicación, no superusuario.
- El volumen `db-data` debe sobrevivir a los redespliegues.
- Respaldo programado activo antes de recibir donaciones reales.

# Notas

- No commitear `.env`.
- Las pasarelas de pago reales aún no están en el alcance; las donaciones quedan en `pending`.
