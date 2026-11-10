---
type: Playbook
title: Desplegar en Portainer desde Gitea
description: Imagen en Docker Hub y Traefik en la red AllanNet, igual que Luau.
tags: [deploy, docker, portainer, traefik]
timestamp: 2026-09-25T00:00:00Z
---

# Trigger

Publicar Donaciones México en Portainer, como `luau`.

# Imagen

El front es `aneg/donaciones-mexico:latest` (Docker Hub de la cuenta propia). Traefik en el Portainer de Allan publica `https://dona-test.iurdsys.net` hacia el puerto **3000**.

En la PC, con `docker login` de la cuenta `aneg`:

```bash
docker build -t aneg/donaciones-mexico:latest .
docker push aneg/donaciones-mexico:latest
```

# Stack en Portainer

1. Stacks → Add stack → Repository.
2. `https://git.allanmontero.com/aneg/Donaciones-Mexico.git`, referencia `refs/heads/main`, path `docker-compose.yml`.
3. Auth de Gitea (usuario + token).
4. Variables: `POSTGRES_PASSWORD`, `NUXT_AUTH_SECRET`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, y las mismas claves en `NUXT_MINIO_ACCESS_KEY` / `NUXT_MINIO_SECRET_KEY`. `NUXT_PUBLIC_SITE_URL` por defecto es `https://dona-test.iurdsys.net`. `NUXT_MINIO_ENDPOINT` por defecto `http://minio:9000`.
5. Deploy. La red `AllanNet` ya existe en el servidor. Postgres y MinIO **no** publican puertos: la web los alcanza por nombre (`db`, `minio`). No añadir Traefik a MinIO.

Cada cambio de código: otro `docker build`, `docker push` y redeploy en Portainer.

# Local

`npm run db:up` crea la red `AllanNet` si falta y levanta Postgres + MinIO (`127.0.0.1`). El sitio en la PC sigue siendo `npm run dev`. Ver [/playbooks/minio-private-storage.md](/playbooks/minio-private-storage.md).

# Relacionado

[/decisions/portainer-stack.md](/decisions/portainer-stack.md)
