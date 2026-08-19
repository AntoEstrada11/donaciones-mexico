---
type: Data File
title: Tabla consents
description: Registro append-only de consentimientos otorgados y revocados, con versión del aviso.
resource: server/database/schema.ts
tags: [privacy, lfpdppp, db, consent]
timestamp: 2026-08-19T00:00:00Z
---

# Propósito

La carga de probar que el titular consintió es del responsable. Esta tabla es esa prueba.

# Columnas

| Columna | Tipo | Nota |
|---------|------|------|
| `id` | uuid PK | |
| `user_id` | uuid FK → `users.id`, `ON DELETE SET NULL` | Nulo si la cuenta se dio de baja o si donó sin sesión |
| `donation_id` | uuid FK → `donations.id`, `ON DELETE SET NULL` | Ata el consentimiento a la donación de un usuario anónimo |
| `type` | enum `consent_type` | `privacy_notice`, `sensitive_data`, `marketing` |
| `granted` | boolean | `false` es una revocación, no un borrado |
| `notice_version` | varchar(32) | Copia de `LEGAL.noticeVersion` al momento de aceptar |
| `ip_hash` | varchar(64) | HMAC-SHA256 de la IP con `NUXT_AUTH_SECRET`, truncado |
| `user_agent` | varchar(255) | |
| `created_at` | timestamptz | |

Índice: `consents_user_created_idx` sobre (`user_id`, `created_at`).

# Invariantes

- **Append-only.** Nunca se hace `UPDATE` ni `DELETE`; revocar inserta una fila nueva.
- **`SET NULL`, no `CASCADE`.** Dar de baja la cuenta no puede destruir la evidencia; la fila
  sobrevive anonimizada.
- **La IP nunca se guarda en claro.** Es dato personal y no necesitamos revertirla.
- El estado vigente de un tipo es la fila más reciente: `getLatestConsents()` en
  `server/utils/consents.ts`.

# Quién escribe aquí

| Momento | Filas |
|---------|-------|
| `POST /api/auth/register` | `privacy_notice`, `sensitive_data` en true; `marketing` según la casilla |
| `POST /api/donations` | `privacy_notice`, `sensitive_data` en true, ligadas a la donación |
| `POST /api/me/consents` | Solo `marketing`, en true o false |
| `DELETE /api/me` | Los tres tipos en false, antes de borrar la cuenta |

# Rotación del secreto

`ip_hash` depende de `NUXT_AUTH_SECRET`. Rotarlo hace que las huellas viejas dejen de ser
comparables con las nuevas. Las filas siguen siendo válidas como evidencia por su fecha y versión
del aviso, que es lo que realmente importa.

# Relacionados

- [/data/personal-data-inventory.md](/data/personal-data-inventory.md)
- [/apis/me-consents.md](/apis/me-consents.md)
- [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md)
