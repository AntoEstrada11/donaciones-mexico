---
type: Playbook
title: Desplegar en Portainer desde Gitea
description: Stack web + Postgres. Portainer clona el repo; no se usa otro anfitrión de la app.
tags: [deploy, docker, portainer, gitea]
timestamp: 2026-09-21T00:00:00Z
---

# Trigger

Publicar Donaciones México en el host donde corre Portainer.

# Piezas en el repo

| Archivo | Uso |
|---------|-----|
| `docker-compose.portainer.yml` | Stack: `db` + `web` |
| `Dockerfile` | Build Nuxt → Nitro |
| `docker-entrypoint.sh` | Migra y arranca `node .output/server/index.mjs` |
| `docker-compose.yml` | **Solo** Postgres en la PC (`npm run db:up`) |

# En Portainer

1. **Stacks → Add stack → Repository**.
2. URL: `https://git.allanmontero.com/aneg/Donaciones-Mexico.git`
3. Referencia: `refs/heads/main`
4. **Compose path:** `docker-compose.portainer.yml` (no el `docker-compose.yml` de local).
5. Auth: usuario Gitea + token de repositorio.
6. **Environment variables** (no las subas a git):

| Variable | Obligatorio | Nota |
|----------|-------------|------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | sí | La app arma `DATABASE_URL` hacia el servicio `db` |
| `NUXT_AUTH_SECRET` | sí | Largo y distinto al de desarrollo |
| `NUXT_PUBLIC_SITE_URL` | sí | URL pública HTTPS del sitio (retorno de pago) |
| `NUXT_PUBLIC_AUTH_HUB_URL` | sí | Hub de operación, sin slash final |
| `NUXT_PUBLIC_APP_CODE` | no | default `donaciones` |
| `NUXT_CHURCHES_API_KEY` | si Odoo la exige | |
| `NUXT_MP_*` / `NUXT_PAYPAL_*` | si cobran | Ver `.env.example` |
| `WEB_BIND` | no | default `0.0.0.0:3000`. Detrás de Traefik: `127.0.0.1:3000` |

7. Deploy. El primer build tarda (compila Nuxt). **Re-pull y rebuild** tras cada `git push` a `main`, o webhook de Gitea al stack.
8. Primera vez, semilla de campañas (una vez):

```bash
docker compose -f docker-compose.portainer.yml exec web node --experimental-strip-types server/database/seed.ts
```

En Portainer: consola del contenedor `web`, mismo comando sin el `docker compose… exec web`.

9. Carrusel: subir fotos en `/admin/personalizar/carrusel`. El volumen `uploads` sobrevive al redespliegue.

# Red

- Postgres **no** se publica a Internet; solo la red Docker `donaciones`.
- La web escucha 3000. Ponle proxy TLS (Traefik/Caddy/Nginx) en el mismo host.

# Tras un push

Rebuild de `web` (cambia código). `db-data` no se borra. El entrypoint aplica migraciones Drizzle al arrancar.

# Local

Sigue [`run-local.md`](/playbooks/run-local.md): `docker-compose.yml` + `npm run dev`. No uses el compose de Portainer en la PC salvo para probar el stack completo (`docker compose -f docker-compose.portainer.yml up --build`).

# Relacionado

[/decisions/portainer-stack.md](/decisions/portainer-stack.md) · [/playbooks/db-migrations.md](/playbooks/db-migrations.md) · [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md)
