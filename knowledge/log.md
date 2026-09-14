# Directory Update Log

## 2026-09-10
* **Update**: `POST /api/dev/contacts` carga donantes ficticios solo en `nuxt dev`. Ver [/playbooks/dev-bulk-contacts.md](/playbooks/dev-bulk-contacts.md).

## 2026-09-09
* **Update**: Perfil muestra confirmación al guardar y recarga los datos. Donar: el botón confirma igual y señala lo que falta. Páginas de donante a ancho `max-w-6xl`.
* **Update**: Operadores no donan: menú y rutas de donante van al panel; `POST /api/donations` 403. El listado admin agrupa por sección y ya no espera a Odoo ni se rompe con estado `refunded`. Catálogos públicos (`campaigns`, slides, métodos) se reutilizan por clave. Ver [/decisions/donor-vs-operator-auth.md](/decisions/donor-vs-operator-auth.md).
* **Update**: La pasarela base es la de `origin/main` (`server/payments/`, cobros, checkout/webhooks). Auth Hub, CFDI/UMA y panel agrupado se conservan encima. Aviso `LEGAL.noticeVersion` 2026-09-09.
* **Update**: Panel de donaciones agrupado por iglesia, tipo y estado. JSON y specs del hero en [/playbooks/personalize.md](/playbooks/personalize.md).
* **Update**: Auth Hub en Oracle `http://159.54.159.34:8000`. Captura CFDI 4.0 en texto, clasificación UMA y alertas; sin Odoo ni PDFs. Ver [/playbooks/auth-hub.md](/playbooks/auth-hub.md) y [/decisions/captura-progresiva.md](/decisions/captura-progresiva.md).

## 2026-09-07
* **Update**: Pasarela v1 implementada y endurecida en local: `server/payments/` (MP + PayPal), checkout/webhooks, `POST /api/payments/mercadopago/sync` al volver de Checkout Pro, `NUXT_PAYMENT_WEBHOOK_BASE_URL` (ngrok) separado de `NUXT_PUBLIC_SITE_URL` (retorno), `vite.server.allowedHosts` para túneles, ping sin firma en modo test del simulador MP. Panel `/admin/personalizar/cobros`. Migración `0005_skinny_pet_avengers.sql`.

## 2026-09-07 (diseño)
* **Update**: Arquitectura de pasarelas documentada: puerto interno + adaptadores; v1 MercadoPago + PayPal; checkout alojado; secretos en env; Stripe/Openpay en fase 2. Decisiones [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md) y [/decisions/checkout-hospedado-pci.md](/decisions/checkout-hospedado-pci.md).

## 2026-09-04
* **Update**: Una sola pantalla Iniciar sesión: donante o personal del hub; el panel no exige cambiar la URL. Ver [/decisions/donor-vs-operator-auth.md](/decisions/donor-vs-operator-auth.md).
* **Update**: Presets de monto rellenan el campo y quedan marcados. Superadmin del Auth Hub entra a `/admin` aunque no tenga membresía `donaciones`. Ver [/playbooks/auth-hub.md](/playbooks/auth-hub.md).
* **Update**: Vercel usa Neon (`donaciones-mexico-db`) para registro y donaciones; Docker sigue solo en local. Ver [/playbooks/vercel.md](/playbooks/vercel.md).
* **Update**: `npm run db:setup` arranca Postgres 17 en Docker, migra y siembra. Ver [/playbooks/run-local.md](/playbooks/run-local.md).
* **Update**: Donantes: `/registro` y `/login` locales. Operadores: `/admin/login` vía Auth Hub. Ver [/decisions/donor-vs-operator-auth.md](/decisions/donor-vs-operator-auth.md).


## 2026-08-27
* **Update**: OKF: rutas reales de slides (`/api/admin/slides`), `ConfirmDialog`, y `refreshNuxtData('site-settings')` tras guardar el pie. Ver [/apis/admin.md](/apis/admin.md), [/apis/site-settings-get.md](/apis/site-settings-get.md), [/data/spei-bank.md](/data/spei-bank.md).
* **Update**: Tras guardar el pie, `refreshNuxtData('site-settings')` (antes `clearNuxtData` dejaba el footer vacío hasta recargar).
* **Update**: `/admin/personalizar/carrusel` confirma el borrado de imágenes con `ConfirmDialog` (mismo patrón que el pie).
* **Update**: `/admin/personalizar/pie` confirma el guardado con un diálogo del sitio (`ConfirmDialog`) en lugar de `window.confirm`.
* **Update**: Admin **Personalizar** sustituye la pestaña Carrusel: subnav Carrusel (`/admin/personalizar/carrusel`) y Pie (`/admin/personalizar/pie`). Tabla `site_settings`, `GET /api/site-settings` y `GET/PATCH /api/admin/site-settings`. Pie y SPEI dejan de vivir en i18n. Ver [/data/spei-bank.md](/data/spei-bank.md) y [/apis/site-settings-get.md](/apis/site-settings-get.md).

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
* **Update**: Documentado que el carrusel del home no se restaura copiando JPG: migrate/seed e instalación nueva dejan `hero_slides` vacía; hay que volver a cargar las fotos desde `/admin/personalizar/carrusel`. Playbook [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md); también migraciones, deploy, local, backup, esquema y APIs de slides.
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
