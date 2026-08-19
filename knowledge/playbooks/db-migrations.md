---
type: Playbook
title: Migraciones de base de datos
description: Generar y aplicar cambios de esquema con Drizzle, e importar el store legado.
tags: [db, postgres, drizzle]
timestamp: 2026-08-18T00:00:00Z
---

# Trigger

Cambió `server/database/schema.ts`, o hay que preparar una base nueva.

# Cambiar el esquema

1. Editar `server/database/schema.ts`.
2. `npm run db:generate` — escribe el SQL en `server/database/migrations/`.
3. Revisar el SQL generado antes de aplicarlo. Drizzle no adivina intenciones: un renombre puede salir como `DROP` + `ADD` y perder datos.
4. `npm run db:migrate` — aplica lo pendiente.
5. Commitear el `.sql` junto con el cambio de `schema.ts`. Las migraciones son parte del código.

# Base nueva desde cero

```bash
docker compose up -d
npm run db:migrate
npm run db:seed
```

# Importar usuarios del store anterior

Migración única desde `server/data/users.json`, vigente solo para instalaciones previas al 2026-08-06:

```bash
npm run db:import-users
```

Es idempotente: los correos ya presentes se omiten y se reportan como saltados. Conserva el `password_hash` original, así que las contraseñas existentes siguen funcionando. Los usuarios reciben un uuid nuevo, ya que el identificador dejó de ser el correo.

Cuando el conteo cuadre, `server/data/users.json` puede archivarse fuera del repo y borrarse; contiene hashes de contraseñas y datos personales.

# Carrusel del home (no viaja con migrate/seed)

`npm run db:seed` solo sincroniza campañas. Las fotos del reel **no** se siembran.

Copiar `public/uploads/hero/` a una instalación nueva (o conservar esos JPG tras borrar el volumen de Postgres) **no** hace que aparezcan en el home. El carrusel lee `hero_slides`; sin esas filas, `GET /api/hero-slides` devuelve `[]` y el hero queda en color de marca.

Hay que volver a cargarlas desde `/admin/slides` (cuenta admin). Detalle: [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md).

# Migración de privacidad (2026-08-19)

`0002_swift_salo.sql` añade:

- Tabla `consents` + enum `consent_type`
- Columna `donor_profiles.wants_receipt` (default `false`)

Bases existentes: `npm run db:migrate` aplica solo lo pendiente. Bases nuevas: migrate + seed como siempre.

# Notas

- Los scripts leen `.env` con `node --env-file`; no requieren dependencias extra.
- No editar a mano el SQL ya aplicado: generar una migración nueva encima.
