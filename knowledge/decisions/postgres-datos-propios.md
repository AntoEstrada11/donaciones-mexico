---
type: Decision
title: Base de datos propia en PostgreSQL
description: Los datos de donantes y donaciones salen de Odoo y pasan a PostgreSQL autogestionado.
tags: [decision, postgres, datos]
status: accepted
timestamp: 2026-08-06T00:00:00Z
---

# Contexto

Por decisión interna, los datos de usuarios dejan de alojarse en Odoo. Había que elegir motor para una base propia. El punto de partida era un store en archivo (`server/data/users.json`) más contactos `res.partner` en Odoo, con tres problemas concretos:

- La unicidad de correo y teléfono se validaba en JavaScript sobre un archivo que se leía y reescribía completo: dos registros simultáneos podían pisarse.
- Los montos eran números de punto flotante de JavaScript.
- `POST /api/donations` no persistía nada.

Se compararon PostgreSQL, MySQL/MariaDB y SQLite. El despliegue es un VPS propio con disco persistente, no hay estimación de volumen y la emisión de CFDI es posible más adelante.

# Decisión

PostgreSQL 17 en Docker sobre el mismo host, con Drizzle ORM como capa de acceso.

Determinaron la elección dos factores:

1. **Sin estimación de escala**, no conviene elegir la opción con techo conocido. SQLite serializa escrituras y carece de tipo decimal nativo.
2. **CFDI posible**, la asimetría de costos es clara: arrancar en Postgres y no necesitarlo cuesta un contenedor; arrancar en SQLite y necesitarlo obliga a migrar datos fiscales y personales en producción.

# Consecuencias

- **+** `NUMERIC(12,2)` para montos, restricciones `UNIQUE` reales y transacciones ACID.
- **+** Se elimina la dependencia de red con Odoo en el camino crítico de registro.
- **+** Respaldos con `pg_dump` y camino claro a recuperación puntual con archivado de WAL.
- **+** Reutiliza experiencia operativa: la instancia de Odoo ya corría sobre PostgreSQL.
- **−** Un servicio más que operar, respaldar y monitorear.
- **−** El desarrollo local ahora requiere Docker.

# Cambios que arrastró

- La llave primaria del usuario pasó de ser el correo a un uuid, para que un cambio de correo no arrastre el historial de donaciones.
- Desaparecen `odooPartnerId` de `AppUser` y `AuthResponse`, `source` de `DonorProfile`, el archivo `server/utils/odoo.ts` y las variables `NUXT_ODOO_*`.
- `GET /api/donations` pasó de público y estático a exigir sesión y devolver el historial del donante.
- El historial dejó de vivir en `sessionStorage`.

# Cuándo reconsiderar

Si el proyecto se mueve a despliegue serverless o multi-réplica, habría que evaluar Postgres gestionado con pooling. Si el volumen resultara mínimo y permanente, SQLite volvería a ser defendible, pero solo antes de tener datos fiscales.

# Reemplaza

- [/decisions/odoo-partner-not-user.md](/decisions/odoo-partner-not-user.md)
- [/decisions/odoo-mock-fallback.md](/decisions/odoo-mock-fallback.md)
- [/decisions/local-auth-json.md](/decisions/local-auth-json.md)
