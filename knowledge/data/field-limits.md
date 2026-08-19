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
| RFC | opcional; solo si `wantsReceipt`; 12 (moral) o 13 (física); patrón SAT básico; mayúsculas |
| Consentimiento (`consent`) | boolean; **obligatorio `true`** en registro y donación (validación servidor) |
| Monto de donación | $1 – $999,999.99 MXN; máx. 2 decimales; sin notación científica |
| Búsqueda de iglesias | máx. 100 caracteres |
| Imagen del hero | JPG/PNG/WebP; máx. 3 MB; alt máx. 160 |

# Dónde se aplica

| Superficie | Uso |
|------------|-----|
| `/login`, `/registro` | correo, contraseña; registro además exige `consent` |
| `/perfil` | nombre, teléfono; fiscal solo si `wantsReceipt` (RFC, domicilio, C.P.) |
| `/donaciones` | monto; `consent` obligatorio antes de enviar |
| `/iglesias` | búsqueda; geolocalización solo tras botón explícito |
| `POST /api/auth/register` | correo, contraseña, nombre, `consent`, `marketing?` |
| `POST /api/auth/login` | correo |
| `PATCH /api/me` | perfil; RFC/C.P. validados solo con `wantsReceipt: true` |
| `POST /api/donations` | monto, `consent` |

# Comportamiento de UI

- Inputs con `maxlength` / `inputmode` según el campo.
- El monto usa `type="text"` + sanitización (no `type="number"`, que permite `e`).
- Bajo el monto se muestra el rango permitido (`donation.amountRange`).
- Registro y donación deshabilitan el botón principal hasta marcar la casilla de consentimiento.
- Datos fiscales en perfil ocultos detrás del interruptor «recibo deducible».

# Relación con privacidad

Los campos de consentimiento no están en `FIELD_LIMITS`; se validan como boolean estricto en el
servidor. Identidad del responsable y versión del aviso: `utils/legal.ts`. Ver
[/legal/aviso-privacidad.md](/legal/aviso-privacidad.md).

# Relación con la base

Los límites de aplicación son iguales o más estrictos que las longitudes de columna en [/data/postgres-schema.md](/data/postgres-schema.md). Cambiar un tope: editar `FIELD_LIMITS` y actualizar este concepto + los contratos de API tocados.
