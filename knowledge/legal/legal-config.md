---
type: Reference
title: Configuración legal (utils/legal.ts)
description: Identidad del responsable, versión del aviso, plazos ARCO y plazos de conservación.
resource: utils/legal.ts
tags: [privacy, lfpdppp, config]
timestamp: 2026-08-19T00:00:00Z
---

# Propósito

Fuente canónica de datos que el aviso integral, el simplificado y el servidor usan para citar al
responsable, estampar versiones en `consents` y documentar plazos. **No duplicar estos valores**
en páginas Vue ni en i18n: importar desde `utils/legal.ts`.

# Exportaciones

## `LEGAL`

| Campo | Tipo | Uso |
|-------|------|-----|
| `razonSocial` | string | Nombre del responsable en aviso y términos |
| `domicilio` | string | Domicilio fiscal (Art. 21). **Pendiente jurídico** |
| `correoArco` | string | Buzón para solicitudes ARCO. **Confirmar dedicado** |
| `telefono` | string | Contacto del responsable |
| `noticeVersion` | string | Se guarda en cada fila de `consents` |
| `noticeDate` | string | Fecha legible mostrada en el aviso |
| `autoridad` | string | Secretaría Anticorrupción y Buen Gobierno |

## `ARCO_DEADLINES`

Plazos en **días hábiles** para el procedimiento ARCO:

| Campo | Valor | Significado |
|-------|-------|-------------|
| `respuesta` | 20 | Plazo para responder la solicitud |
| `prorroga` | 20 | Prórroga máxima posible |
| `ejecucion` | 10 | Plazo para hacer efectiva la respuesta |

## `RETENTION`

Textos de conservación referenciados en el aviso (sección 6) y en
[/security/data-retention.md](/security/data-retention.md):

| Clave | Descripción |
|-------|-------------|
| `cuentaActiva` | Mientras la cuenta permanezca activa |
| `trasCancelacion` | Baja de cuenta: perfil eliminado; donaciones anonimizadas |
| `datosFiscales` | 5 años desde CFDI (Art. 30 CFF), cuando exista timbrado |
| `consentimientos` | 5 años como evidencia del consentimiento otorgado |

# Cuándo actualizar

| Cambio | Acción |
|--------|--------|
| Texto del aviso integral | Editar `pages/privacidad/index.vue` + subir `noticeVersion` y `noticeDate` |
| Nueva finalidad de tratamiento | Bump de `noticeVersion`; consentimientos previos no valen para la nueva finalidad |
| Plazos de conservación | Actualizar `RETENTION`, sección 6 del aviso, [/security/data-retention.md](/security/data-retention.md) |
| Domicilio o buzón ARCO | Actualizar `LEGAL` tras confirmación jurídica |

# Consumidores

- `pages/privacidad/index.vue`, `pages/terminos/index.vue`
- `components/PrivacyNoticeShort.vue`
- `server/utils/consents.ts` (estampa `notice_version`)
- `server/api/me/export.get.ts` (incluye versión del aviso en la exportación)

# Relacionados

- [/legal/aviso-privacidad.md](/legal/aviso-privacidad.md)
- [/decisions/contenido-legal-en-paginas.md](/decisions/contenido-legal-en-paginas.md)
- [/data/consents-table.md](/data/consents-table.md)
