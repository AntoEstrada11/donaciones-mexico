# Donaciones México

Plataforma de donaciones en línea para la Iglesia Universal del Reino de Dios en México.

## Stack

- **Nuxt 3** + Vue 3 + Tailwind + i18n (`es-MX`)
- **Supabase Auth** — usuarios, sesiones, reset de contraseña
- **Supabase Postgres (`profiles`)** — perfil, teléfono único, vínculo Odoo
- **Odoo** (opcional) — contactos `res.partner` sin usuario de login

## Requisitos

- Node.js 18+
- Proyecto Supabase

## Setup Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. En **SQL Editor**, ejecuta `supabase/schema.sql`  
   - Si ya lo corriste antes, ejecuta `supabase/donations.sql` (tabla + `payment_reference` + RLS update)
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (o tu dominio)
   - Redirect URLs (agrega todas las que uses):
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/actualizar-password`
4. Copia keys a `.env` (ver `.env.example`):
   - `NUXT_PUBLIC_SUPABASE_URL` + `SUPABASE_URL`
   - `NUXT_PUBLIC_SUPABASE_KEY` + `SUPABASE_KEY` (anon / publishable)
   - `SUPABASE_SERVICE_KEY` (service role, **solo servidor**)
5. Opcional: desactiva confirmación de email en Auth → Providers → Email para pruebas locales, o deja confirmación activa (el registro pedirá abrir el correo).

## Inicio

```bash
cp .env.example .env
# completa variables Supabase (y Odoo si aplica)
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/iglesias` | Directorio (API Universal) |
| `/donaciones` | Flujo de donación |
| `/registro` | Alta con correo + contraseña |
| `/login` | Acceso |
| `/recuperar` | Solicitar reset de contraseña |
| `/auth/actualizar-password` | Nueva contraseña (link del email) |
| `/auth/callback` | Confirmación de email / OAuth |
| `/perfil` | Datos del donante (protegido) |
| `/historial` | Historial del usuario (protegido) |
| `/docs` | Documentación OpenAPI (Scalar) |
| `/openapi.yaml` | Spec OpenAPI 3 |

## API (OpenAPI)

Documentación interactiva: [http://localhost:3000/docs](http://localhost:3000/docs)

- Spec: [`public/openapi.yaml`](./public/openapi.yaml)
- Para desactivar en producción: `NUXT_PUBLIC_API_DOCS=false`
- Rutas autenticadas usan sesión Supabase (cookies). Inicie sesión en `/login` y pruebe desde el mismo navegador.

Endpoints principales:

| Método | Ruta | Auth | Body |
|--------|------|------|------|
| GET | `/api/campaigns` | No | — |
| GET | `/api/churches` | No | query `latitude`, `longitude` |
| POST | `/api/auth/bootstrap` | Sí | vacío |
| GET | `/api/me` | Sí | — |
| PATCH | `/api/me` | Sí | `name`, `phone`, `street`, `city`, `state`, `zip`, `rfc` |
| GET | `/api/donations` | Sí | — |
| POST | `/api/donations` | Sí | `churchId`, `campaignId`, `amount`, `method?`, `churchName?` |
| PATCH | `/api/donations/{id}` | Sí | `{ "status": "paid" }` |

## Flujo de usuarios

1. Registro con **email único** (ID de cuenta) en `/registro`
2. Supabase crea `auth.users` + fila en `profiles` (trigger SQL)
3. Bootstrap (`/api/auth/bootstrap`) crea contacto Odoo y guarda `odoo_partner_id`
4. En `/perfil` completa teléfono (**único**, normalizado) y dirección
5. Login en `/login` · Reset en `/recuperar` → email → `/auth/actualizar-password`
6. Donar en `/donaciones` **requiere sesión**: se guarda en `donations` con `user_id`
7. `/historial` lista solo las donaciones de ese usuario
8. Rutas `/perfil` e `/historial` requieren sesión (middleware)

## Notas de seguridad

- Contraseñas solo en Supabase Auth (nunca en Odoo ni JSON local)
- RLS: cada usuario solo lee/actualiza su `profiles`
- Service role solo en servidor (`SUPABASE_SERVICE_KEY`)
- Headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- No commitees `.env`

## Gitea

Repositorio: `https://git.allanmontero.com/aneg/Donaciones-Mexico.git`  
Rama de trabajo recomendada: **`Dev`**
