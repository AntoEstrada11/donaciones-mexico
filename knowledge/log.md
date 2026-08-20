# Directory Update Log

## 2026-08-19 (panel admin usuarios)
* **Update**: Retirada promoción de rol admin desde `/admin/users` (410 en PATCH role). Estado donante activo/baja con auditoría en `user_status_events`. Restablecimiento de contraseña vía enlace (`/restablecer-contrasena`).

## 2026-08-19 (plan B iglesias)
* **Update**: `server/data/churches.json` regenerado con 253 templos e ids Odoo reales. Script `npm run db:sync-churches`. Ver [/data/churches-json.md](/data/churches-json.md).

## 2026-08-19 (iglesias vía Odoo)
* **Update**: `GET /api/churches` consulta Odoo directo (`miembros.iurdsys.net/api/churches`) con API key en servidor, caché 1 h, host allowlist y rate limit. WordPress queda fuera del camino. Ver [/decisions/churches-odoo-direct.md](/decisions/churches-odoo-direct.md).
* **Update**: `source` pasa de `wordpress` a `odoo`. Textos legales al usuario sin cambio (siguen citando universal.org.mx).

## 2026-08-19 (documentación OKF)
* **Update**: [legal-config.md](/legal/legal-config.md) — referencia de `utils/legal.ts`.
* **Update**: Sección [/legal/](/legal/) con [aviso-privacidad.md](/legal/aviso-privacidad.md) (rutas, componentes, versionado, checklist pre-publicación).
* **Update**: [rate-limiting.md](/security/rate-limiting.md), decisión [contenido-legal-en-paginas.md](/decisions/contenido-legal-en-paginas.md).
* **Update**: Sincronizados `project.md`, `roadmap.md`, `field-limits.md`, `me-get.md`, `churches-get.md`, playbooks `run-local`, `db-migrations`, `deploy` e índices de `security/`, `decisions/` e `index.md`.

## 2026-08-19
* **Update**: Cumplimiento LFPDPPP (ley vigente desde el 21/03/2025). Aviso de privacidad integral en `/privacidad`, términos en `/terminos`, aviso simplificado junto a cada formulario y enlaces en el pie. Identidad del responsable y versionado en `utils/legal.ts`.
* **Update**: Consentimiento expreso para datos sensibles (creencias religiosas). `POST /api/auth/register` y `POST /api/donations` devuelven `422` sin `consent: true`; la evidencia se guarda en la tabla `consents`. Ver [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md) y [/data/consents-table.md](/data/consents-table.md).
* **Update**: Derechos ARCO en autoservicio desde `/perfil`: [GET /api/me/export](/apis/me-export.md), [DELETE /api/me](/apis/me-delete.md) y [/apis/me-consents.md](/apis/me-consents.md).
* **Update**: Minimización de datos fiscales. RFC y domicilio solo se piden si el donante activa el recibo deducible (`donor_profiles.wants_receipt`) y se borran al desactivarlo. Ver [/decisions/minimizacion-datos-fiscales.md](/decisions/minimizacion-datos-fiscales.md).
* **Update**: La geolocalización en `/iglesias` ya no se pide en `onMounted`; requiere acción explícita y avisa que las coordenadas salen hacia `universal.org.mx`.
* **Update**: Límite de tasa por IP en login, registro, donaciones y escrituras de `/api/me` (`server/middleware/rateLimit.ts`). Ver [/security/layers.md](/security/layers.md).
* **Update**: Nuevos conceptos [/data/personal-data-inventory.md](/data/personal-data-inventory.md) y [/security/data-retention.md](/security/data-retention.md); nuevos playbooks [/playbooks/arco-request.md](/playbooks/arco-request.md) y [/playbooks/data-breach.md](/playbooks/data-breach.md).
* **Pendiente**: Confirmar con el área jurídica el domicilio fiscal y el buzón ARCO en `utils/legal.ts` antes de publicar. Hoy son marcadores.

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
