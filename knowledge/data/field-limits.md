---
type: Reference
title: Restricciones de formularios
description: Límites y formatos de los campos de entrada en cliente y servidor.
resource: utils/fieldLimits.ts
tags: [validation, forms, ux]
timestamp: 2026-08-07T00:00:00Z
---

# Fuente

Constantes y helpers en `utils/fieldLimits.ts`. Misma fuente para páginas Vue y rutas Nitro, para que UI y API no diverjan.

# Límites

| Campo | Restricción |
|-------|-------------|
| Correo | máx. 255; formato `local@dominio.tld`; normalizado a minúsculas |
| Contraseña | 6–128 caracteres |
| Nombre | 1–160 caracteres |
| Teléfono | opcional; 10–15 dígitos (México / E.164); display máx. 20 |
| Dirección | máx. 200 |
| Ciudad / Estado | máx. 120 |
| C.P. | opcional; exactamente 5 dígitos |
| RFC | opcional; 12 (moral) o 13 (física); patrón SAT básico; mayúsculas |
| Monto de donación | $1 – $999,999.99 MXN; máx. 2 decimales; sin notación científica |
| Búsqueda de iglesias | máx. 100 caracteres |
| Imagen del hero | JPG/PNG/WebP; máx. 3 MB; alt máx. 160 |

# Dónde se aplica

| Superficie | Uso |
|------------|-----|
| `/login`, `/registro` | correo y contraseña |
| `/perfil` | nombre, teléfono, domicilio, C.P., RFC |
| `/donaciones` | monto (presets + “otro monto”) |
| `/iglesias` | búsqueda |
| `POST /api/auth/register` | correo, contraseña, nombre |
| `POST /api/auth/login` | correo |
| `PATCH /api/me` | perfil completo |
| `POST /api/donations` | monto (revalida y redondea a centavos) |

# Comportamiento de UI

- Inputs con `maxlength` / `inputmode` según el campo.
- El monto usa `type="text"` + sanitización (no `type="number"`, que permite `e`).
- Bajo el monto se muestra el rango permitido (`donation.amountRange`).

# Relación con la base

Los límites de aplicación son iguales o más estrictos que las longitudes de columna en [/data/postgres-schema.md](/data/postgres-schema.md). Cambiar un tope: editar `FIELD_LIMITS` y actualizar este concepto + los contratos de API tocados.
