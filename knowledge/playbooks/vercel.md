---
type: Playbook
title: Desplegar en Vercel
description: Nuxt 3 en Vercel necesita Postgres en la nube y las mismas variables que .env.example.
tags: [deploy, vercel]
timestamp: 2026-09-04T22:00:00Z
---

# Por qué no basta con “subir el repo”

Vercel es serverless. **No puede usar** el Docker `donaciones-db` de tu PC. Si `DATABASE_URL` apunta a `127.0.0.1` o `localhost`, el registro responde error (en logs: `ECONNREFUSED 127.0.0.1:5432`).

Hay **dos entornos de datos**:

| Entorno | Base | App |
|---------|------|-----|
| Local | Docker `npm run db:setup` | `npm run dev` → `http://localhost:3000` |
| Pruebas en la nube | Neon (marketplace Vercel, recurso `donaciones-mexico-db`) | `https://donaciones-mexico.vercel.app` |

Production, Preview y Development en Vercel apuntan al **mismo** Neon. El Docker local **no** se sincroniza con Neon: cuentas de registro en Vercel no aparecen en tu Postgres local.

# Steps

1. Base en la nube: `npx vercel integration add neon --plan free_v3 -m auth=false --no-env-pull` (aceptar términos en el navegador si el CLI lo pide).
2. Migrar y sembrar **contra Neon**, no contra Docker: `npx vercel env pull .env.vercel.production --environment production --yes` y luego `node --experimental-strip-types --env-file=.env.vercel.production server/database/migrate.ts` (y `seed.ts`). Borrar el archivo pull después; está en `.gitignore`.
3. `npx vercel --prod --yes` desde el repo (o importar en vercel.com). Framework: Nuxt.
4. En Vercel → Settings → Environment Variables, al menos:

| Variable | Notas |
|----------|--------|
| `DATABASE_URL` | Postgres en la nube |
| `NUXT_AUTH_SECRET` | Largo y distinto al de desarrollo |
| `NUXT_PUBLIC_SITE_URL` | `https://tu-proyecto.vercel.app` |
| `NUXT_PUBLIC_AUTH_HUB_URL` | `http://159.54.159.34:8000` (Oracle, HTTP). No ngrok. |
| `NUXT_PUBLIC_APP_CODE` | `donaciones` |
| `NUXT_CHURCHES_API_KEY` | Si Odoo la exige |
| `NUXT_MP_*` / `NUXT_PAYPAL_*` | Solo si vas a cobrar (nombres en `.env.example`) |

5. Redeploy. Smoke: home, `/login` (cuenta invitada en el hub), `/iglesias`, `/privacidad`.

# Auth Hub y Vercel

El login sale del servidor de Vercel hacia `http://159.54.159.34:8000`. No uses ngrok. El Hub está en HTTP; este sitio lo llama desde Nitro.
