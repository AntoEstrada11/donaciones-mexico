---
type: Playbook
title: Respaldo y restauración
description: Sacar y reponer copias de la base PostgreSQL del proyecto.
tags: [db, backup, postgres]
timestamp: 2026-08-18T00:00:00Z
---

# Trigger

Respaldo periódico, o hay que reponer datos tras un incidente o una migración fallida.

# Respaldo manual

```bash
docker exec donaciones-db pg_dump -U donaciones -d donaciones -Fc > donaciones-$(date +%F).dump
```

El formato `-Fc` (custom) permite restaurar tablas sueltas y va comprimido.

# Restauración

```bash
cat donaciones-2026-08-06.dump | docker exec -i donaciones-db pg_restore -U donaciones -d donaciones --clean --if-exists
```

`--clean` borra los objetos existentes antes de reponerlos: verificar que se apunta a la base correcta.

Un `pg_restore` de un dump **completo** sí trae `hero_slides`. Una base nueva solo con `db:migrate` + `db:seed` no: aunque copies `public/uploads/hero/`, el reel queda vacío hasta recargar las fotos en `/admin/slides`. Ver [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md).

# Respaldo programado en el servidor

Una entrada de cron diaria basta para esta etapa:

```
0 3 * * * docker exec donaciones-db pg_dump -U donaciones -d donaciones -Fc > /respaldos/donaciones-$(date +\%F).dump
```

Conservar unas semanas de historia y verificar de vez en cuando que un `pg_restore` sobre una base vacía funciona. Un respaldo que nunca se restauró no es un respaldo.

# Cuándo subir de nivel

Si el proyecto empieza a emitir comprobantes fiscales, `pg_dump` diario deja de alcanzar: hay que activar archivado de WAL para recuperar a un punto exacto en el tiempo.

# Nunca

Guardar los volcados dentro del repositorio ni en el bundle `knowledge/`: contienen datos personales y hashes de contraseñas.
