# Directory Update Log

## 2026-08-18
* **Update**: `GET /api/churches` proxea WordPress; si `/wp-json/` responde 500, el directorio usa `churches.json` y avisa. Ver [/apis/churches-get.md](/apis/churches-get.md).
* **Update**: Tutorial SPEI en `/spei` (datos bancarios, pasos, copiar CLABE); enlaces en home, pie y flujo de donación. Conceptos [/data/spei-bank.md](/data/spei-bank.md) y [/roadmap.md](/roadmap.md).
* **Update**: Playbook y script `db:set-password` para resetear la contraseña de una cuenta (scrypt) o crear el primer admin con `--create`. Ver [/playbooks/set-password.md](/playbooks/set-password.md).
* **Update**: Documentado que el carrusel del home no se restaura copiando JPG: migrate/seed e instalación nueva dejan `hero_slides` vacía; hay que volver a cargar las fotos desde `/admin/slides`. Playbook [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md); también migraciones, deploy, local, backup, esquema y APIs de slides.
* **Update**: `GET /api/churches` proxea WordPress; si `/wp-json/` responde 500, el directorio usa `churches.json` y avisa. Ver [/apis/churches-get.md](/apis/churches-get.md).

## 2026-08-07
* **Update**: Panel admin (`role` en users), carrusel del hero con degradado, APIs `/api/admin/*` y `GET /api/hero-slides`. Ver [/decisions/admin-role.md](/decisions/admin-role.md) y [/apis/admin.md](/apis/admin.md).
* **Update**: Restricciones de formularios unificadas en `utils/fieldLimits.ts` (UI + API). Concepto [/data/field-limits.md](/data/field-limits.md); contratos actualizados: register, login, `PATCH /api/me`, `POST /api/donations`.
* **Update**: Arquitectura e índices enlazan validación compartida; esquema Postgres distingue invariantes de BD vs límites de aplicación.
* **Update**: Navegación: estado activo de “Iglesias” vs “Donar” según ruta real (`components/AppHeader.vue`), no según el destino del enlace.

## 2026-08-06
* **Update**: Salida de Odoo. Los datos de donantes y donaciones pasan a PostgreSQL propio con Drizzle ORM. Ver [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md) y [/data/postgres-schema.md](/data/postgres-schema.md).
* **Update**: `POST /api/donations` ahora persiste y `GET /api/donations` exige sesión y devuelve solo el historial del donante. Ver [/apis/](/apis/).
* **Update**: Nuevos playbooks de migraciones y respaldos; `run-local` y `deploy` incluyen la base. Ver [/playbooks/](/playbooks/).
* **Deprecation**: Quedan superadas las decisiones de partner Odoo, modo mock de Odoo y almacenamiento de usuarios en JSON.

## 2026-07-20
* **Initialization**: Bundle OKF creado desde `IA/conocimiento/okf/template/knowledge/` y rellenado con el contexto de Donaciones México (APIs, datos, auth/Odoo, playbooks y decisiones).
