---
type: Schema
title: Esquema PostgreSQL
description: Tablas, llaves y restricciones de la base propia de donantes y donaciones.
resource: server/database/schema.ts
tags: [data, postgres, drizzle]
timestamp: 2026-09-07T00:00:00Z
---

# Ubicación

- Definición Drizzle: `server/database/schema.ts`
- SQL generado: `server/database/migrations/`
- Conexión: `server/utils/db.ts` (lee `DATABASE_URL`)

# Tablas

## `users` — cuenta de acceso

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | generado en la base; identidad estable del donante |
| `email` | varchar(255) | único (`users_email_key`) |
| `name` | varchar(160) | |
| `password_hash` | text | formato `salt:hash` scrypt |
| `role` | enum `user_role` | `donor` (default) o `admin` |
| `status` | enum `donor_status` | `active` (default) o `deactivated`; solo aplica operativamente a donantes |
| `profile_complete` | boolean | derivado de nombre + teléfono |
| `created_at` / `updated_at` | timestamptz | |

## `donor_profiles` — datos personales y fiscales

| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` | uuid PK/FK | → `users.id`, `ON DELETE CASCADE` |
| `phone` | varchar(32) | tal como lo capturó el donante |
| `phone_digits` | varchar(20) | solo dígitos; único (`donor_profiles_phone_digits_key`) |
| `wants_receipt` | boolean | default `false`; condiciona si se piden y conservan los datos fiscales |
| `street`, `city`, `state`, `zip` | texto | domicilio; se vacían si `wants_receipt` pasa a `false` |
| `rfc` | varchar(13) | en mayúsculas; insumo para un eventual CFDI |
| `updated_at` | timestamptz | |

Separar el perfil de la cuenta acota el manejo de PII: la tabla de acceso no contiene domicilio ni datos fiscales. Los campos fiscales solo se llenan bajo demanda: ver [/decisions/minimizacion-datos-fiscales.md](/decisions/minimizacion-datos-fiscales.md).

## `campaigns` — catálogo de tipos de donación

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `slug` | varchar(80) | único; llave estable para sembrar |
| `name`, `description`, `type` | texto | |
| `sort_order` | integer | orden de despliegue en la UI |
| `active` | boolean | filtra lo que expone la API |

## `donations` — movimientos

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK nullable | → `users.id`, `ON DELETE SET NULL`; nulo si no había sesión |
| `church_external_id` | varchar(64) | id de la API de WordPress; no hay tabla local de iglesias |
| `campaign_id` | uuid FK | → `campaigns.id` |
| `amount` | numeric(12,2) | exacto; nunca punto flotante |
| `currency` | varchar(3) | default `MXN` |
| `status` | enum `donation_status` | `paid`, `pending`, `failed`, `cancelled` |
| `method` | enum `donation_method` | `spei`, `card` |
| `created_at` / `updated_at` | timestamptz | |

Índices: `donations_user_created_idx` (historial por donante) y `donations_campaign_idx` (reportes por campaña).

### Extensión planificada (pasarelas v1)

Aún no migrada. Al implementar cobro real:

| Cambio | Detalle |
|--------|---------|
| Enums | `method` + `paypal`; `status` + `refunded`; `payment_provider` (`mercadopago`, `paypal`, `spei_manual`); `payment_mode` (`test`, `live`) |
| Columnas en `donations` | `provider`, `provider_reference`, `provider_payment_id`, `paid_at` |
| Tabla `payment_events` | Idempotencia/auditoría append-only; unique `(provider, provider_event_id)`; sin body PII |
| Tabla `payment_settings` | Una fila (`id=1`): proveedor de tarjeta activo, modo, flags de métodos; **sin secretos** |

Ver [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md).

## `consents` — evidencia de consentimiento

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK nullable | → `users.id`, `ON DELETE SET NULL` |
| `donation_id` | uuid FK nullable | → `donations.id`, `ON DELETE SET NULL`; cubre donativos sin sesión |
| `type` | enum `consent_type` | `privacy_notice`, `sensitive_data`, `marketing` |
| `granted` | boolean | `false` es una revocación |
| `notice_version` | varchar(32) | versión del aviso aceptada |
| `ip_hash` | varchar(64) | HMAC de la IP, nunca la IP en claro |
| `user_agent` | varchar(255) | |
| `created_at` | timestamptz | |

Índice: `consents_user_created_idx`. Tabla append-only; detalle en [/data/consents-table.md](/data/consents-table.md).

## `hero_slides` — carrusel del home

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `filename` | varchar(255) | nombre del archivo en `public/uploads/hero/`; la presencia del JPG no crea la fila, ni al revés |
| `alt` | varchar(160) | texto alternativo |
| `sort_order` | integer | orden de aparición |
| `active` | boolean | solo las activas salen en `GET /api/hero-slides` |
| `created_at` | timestamptz | |

El home no recorre el directorio: solo muestra filas con `active = true`. Copiar archivos a `public/uploads/hero/` en una instalación nueva o tras recrear la base **no** restaura el reel. Hay que volver a subirlos en `/admin/personalizar/carrusel`. Ver [/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md).

## `site_settings` — pie y SPEI públicos

Una sola fila (`id = 1`). Contacto institucional y datos SPEI editables desde `/admin/personalizar/pie`.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | integer PK | siempre `1` |
| `contact_phone` | varchar(40) | teléfono del pie |
| `contact_email` | varchar(255) | correo del pie |
| `spei_bank` | varchar(120) | banco |
| `spei_beneficiary` | varchar(200) | beneficiario |
| `spei_clabe` | varchar(18) | CLABE 18 dígitos |
| `spei_concept` | varchar(80) | concepto de transferencia |
| `updated_at` | timestamptz | |

Semilla: `utils/siteSettingsDefaults.ts` vía `npm run db:seed`. Ver [/data/spei-bank.md](/data/spei-bank.md).

## `user_status_events` — auditoría de estado donante

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | → `users.id`, `ON DELETE CASCADE` |
| `status` | enum `donor_status` | valor aplicado (`active` o `deactivated`) |
| `actor_user_id` | uuid FK nullable | admin que ejecutó el cambio; `null` en alta inicial |
| `created_at` | timestamptz | momento del cambio |

Índice: `user_status_events_user_created_idx`. El panel admin muestra el último evento por donante.

## `password_reset_tokens` — enlaces de restablecimiento

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | → `users.id`, `ON DELETE CASCADE` |
| `token_hash` | varchar(64) | HMAC del token; nunca el token en claro |
| `expires_at` | timestamptz | vigencia 24 h desde creación |
| `used_at` | timestamptz nullable | consumo único |
| `created_by_user_id` | uuid FK nullable | admin que generó el enlace |
| `created_at` | timestamptz | |

Índices: `password_reset_tokens_user_idx`, `password_reset_tokens_hash_key` (único).

# Invariantes que sostiene la base

- Un correo no puede repetirse entre cuentas.
- Un teléfono no puede repetirse entre donantes, sin importar el formato capturado.
- Una donación siempre apunta a una campaña existente.
- Borrar un donante borra su perfil pero conserva sus donaciones con `user_id` nulo, para no perder el registro contable.
- Borrar un donante tampoco destruye sus consentimientos: quedan anonimizados (`user_id` nulo) como evidencia de que se otorgaron. Ver [/security/data-retention.md](/security/data-retention.md).

Los límites de formato (rango de monto, RFC, C.P., longitudes) se aplican en la capa de aplicación: [/data/field-limits.md](/data/field-limits.md).

# Limitaciones conocidas

- No se guarda un nombre histórico de la iglesia: si el catálogo externo cambia, el historial muestra solo el identificador.
- No hay tabla de auditoría de cambios de estado de donación; será necesaria si se emiten comprobantes fiscales.
- Las fotos del carrusel no se siembran ni se reconstruyen al migrar: sin filas en `hero_slides` el reel queda vacío aunque existan archivos en disco.

# Operación

Ver [/playbooks/db-migrations.md](/playbooks/db-migrations.md) y [/playbooks/db-backup.md](/playbooks/db-backup.md).
