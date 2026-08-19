---
type: Playbook
title: Correr en local
description: Levantar la base y el servidor de desarrollo de Donaciones México.
tags: [dev, local]
timestamp: 2026-08-18T00:00:00Z
---

# Trigger

Necesitas desarrollar o depurar en la máquina local.

# Requisitos

Node.js 18+ (probado en 24), npm y Docker.

# Steps

1. `npm install`
2. Copiar `.env.example` → `.env`. Para desarrollo los valores por defecto sirven tal cual.
3. Levantar PostgreSQL: `docker compose up -d`
4. Aplicar el esquema: `npm run db:migrate`
5. Sembrar campañas: `npm run db:seed`
6. `npm run dev`
7. Abrir [http://localhost:3000](http://localhost:3000)

Los pasos 3 a 5 solo se repiten cuando cambia el esquema o se borra el volumen.

# Verificación rápida

- `GET /api/campaigns` devuelve 4 campañas con id uuid.
- Registro en `/registro` crea la fila en `users` y su `donor_profiles`.
- Una donación en `/donaciones` aparece luego en `/historial`.

# Inspeccionar la base

```bash
docker exec -it donaciones-db psql -U donaciones -d donaciones
```

# Problemas frecuentes

| Síntoma | Causa | Salida |
|---------|-------|--------|
| `DATABASE_URL no está configurada` | Falta `.env` | Copiar `.env.example` |
| `ECONNREFUSED 127.0.0.1:5432` | Contenedor abajo | `docker compose up -d` |
| `relation "users" does not exist` | Falta migrar | `npm run db:migrate` |
| `Another Nuxt dev server is already running` | Instancia previa viva | Detener el proceso indicado o usar el puerto que reporta |
| Carrusel del home sin fotos | Hay JPG en `public/uploads/hero/` pero `hero_slides` está vacía (base nueva o volumen recreado) | Volver a subirlas en `/admin/slides`; copiar archivos no alcanza. Ver [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md) |
