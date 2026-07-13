# Donaciones México

Plataforma de donaciones en línea para la Iglesia Universal del Reino de Dios en México. Réplica funcional con datos mock, inspirada en [doar.universal.org](https://doar.universal.org).

## Requisitos

- Node.js 18+
- npm

## Inicio rápido

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Rutas implementadas (fase 1)

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio — hero, pasos, tipos de donación |
| `/iglesias` | Directorio de iglesias con búsqueda |

## API mock (`server/api/`)

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/churches` | 12 iglesias de ejemplo |
| `GET /api/campaigns` | Diezmo, Ofrenda, Obra social, Propósito de fe |
| `GET /api/donations` | Donaciones con estados `paid`, `pending`, `failed`, `cancelled` |
| `POST /api/auth/login` | Login mock → `{ token: 'mock', name: 'Usuario Demo' }` |

## Stack

- **Nuxt 3** — framework
- **Tailwind CSS** — estilos
- **@nuxtjs/i18n** — internacionalización (`es-MX`, archivos en `i18n/locales/`)

## Próximas fases

Login, donación (`/donaciones`), historial, perfil, campañas, tutorial SPEI (`/spei`).

## Notas

- Sin pasarelas de pago reales ni autenticación de producción.
- Donación recurrente: placeholder «Próximamente».
