# Donaciones México

Plataforma de donaciones en línea para la Iglesia Universal del Reino de Dios en México. Inspirada en [doar.universal.org](https://doar.universal.org).

## Requisitos

- Node.js 18+ (probado en 24)
- npm
- Docker (para PostgreSQL)

## Inicio rápido

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts de base de datos

| Script | Descripción |
|--------|-------------|
| `npm run db:generate` | Genera el SQL de migración a partir de `server/database/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Siembra las campañas desde `server/data/campaigns.json` |
| `npm run db:import-users` | Migración única del store legado `server/data/users.json` |
| `npm run db:promote-admin` | Asigna `role=admin` a un correo existente |
| `npm run db:set-password` | Cambia la contraseña de un usuario (`NEW_PASSWORD`, opcional `--create`) |
| `npm run db:sync-churches` | Regenera `server/data/churches.json` desde Odoo (plan B) |

## Rutas implementadas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio — hero, pasos, tipos de donación |
| `/iglesias` | Directorio de iglesias con búsqueda |
| `/donaciones` | Alta de donación (iglesia, campaña, monto, método) |
| `/historial` | Historial de donaciones del donante |
| `/login`, `/registro` | Acceso y alta de cuenta |
| `/perfil` | Datos personales y fiscales |
| `/spei` | Tutorial de transferencia SPEI (CLABE y pasos) |
| `/admin` | Panel operativo (requiere rol admin) |
| `/admin/personalizar/carrusel` | Carrusel del hero |
| `/admin/personalizar/pie` | Contacto y datos SPEI del pie |

## API (`server/api/`)

| Endpoint | Auth | Descripción |
|----------|------|-------------|
| `POST /api/auth/register` | — | Alta de cuenta y perfil |
| `POST /api/auth/login` | — | Login y emisión de token |
| `GET /api/me` | Bearer | Perfil del donante |
| `PATCH /api/me` | Bearer | Actualiza perfil |
| `GET /api/campaigns` | — | Campañas activas |
| `GET /api/churches` | — | Directorio (Odoo o muestra) |
| `GET /api/site-settings` | — | Contacto y SPEI del pie |
| `GET /api/donations` | Bearer | Historial del donante |
| `POST /api/donations` | Opcional | Registra una donación |

## Stack

- **Nuxt 3** — framework
- **PostgreSQL 17** — base de datos propia
- **Drizzle ORM** — acceso a datos y migraciones
- **Tailwind CSS** — estilos
- **@nuxtjs/i18n** — internacionalización (`es-MX`, archivos en `i18n/locales/`)

El directorio de iglesias se consume de Odoo IURD (`miembros.iurdsys.net`) a través de `GET /api/churches`. Si Odoo no responde, se usa `server/data/churches.json` y la página avisa.

## Documentación

La base de conocimiento del proyecto vive en [`knowledge/`](knowledge/index.md): esquema de datos, contratos de API, playbooks de operación y decisiones de arquitectura.

## Notas

- Sin pasarelas de pago reales: las donaciones quedan en estado `pending`.
- Sin emisión de CFDI todavía; el RFC ya se captura en el perfil.
- Donación recurrente: pendiente (el home muestra «Próximamente»).
- Pendientes agrupados en [`knowledge/roadmap.md`](knowledge/roadmap.md).
- Carrusel del home: en instalación nueva o tras recrear la base, copiar los JPG a `public/uploads/hero/` no basta; hay que volver a subirlos en `/admin/personalizar/carrusel`. Detalle en [`knowledge/playbooks/hero-slides-restore.md`](knowledge/playbooks/hero-slides-restore.md).
