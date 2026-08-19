---
type: Decision
title: Contenido legal en páginas vs i18n
description: El aviso integral vive en Vue; las etiquetas cortas de UI van a es-MX.json.
tags: [privacy, i18n, legal, ui]
timestamp: 2026-08-19T00:00:00Z
---

# Contexto

El cumplimiento LFPDPPP exige un aviso de privacidad integral extenso y un aviso simplificado.
El proyecto usa `@nuxtjs/i18n` con un solo locale (`es-MX`), pero podría crecer a más idiomas.

# Decisión

| Tipo de texto | Ubicación | Ejemplo |
|---------------|-----------|---------|
| Aviso integral (documento completo) | `pages/privacidad/index.vue` | Secciones 1–10 del Art. 21 |
| Términos de uso | `pages/terminos/index.vue` | Naturaleza del donativo, responsabilidad |
| Aviso simplificado (párrafo corto) | `components/PrivacyNoticeShort.vue` + claves `legal.short*` en i18n | Texto junto al formulario |
| Casillas, botones, errores legales | `i18n/locales/es-MX.json` → `legal.*` | `legal.consentLabel`, `legal.consentRequired` |
| Identidad del responsable, plazos, versión | `utils/legal.ts` | `LEGAL`, `ARCO_DEADLINES`, `RETENTION` |

# Por qué no todo en i18n

- El aviso integral es un **documento versionado** (`LEGAL.noticeVersion`). Cambiarlo implica
  subir la versión y posiblemente recabar consentimiento de nuevo; conviene verlo como una unidad
  en un solo archivo, no cientos de claves dispersas.
- Las cadenas de UI sí cambian con frecuencia menor y se benefician del bundle i18n.

# Por qué no todo en Vue

- Reutilizar la misma casilla en registro y donación exige textos cortos compartidos vía i18n.
- Los mensajes de error (`422` de consentimiento) se alinean con `legal.consentRequired`.

# Consecuencias

- Si se añade otro idioma, habrá que traducir las páginas legales completas, no solo el JSON.
- Cualquier cambio al aviso integral debe ir acompañado de bump de `noticeVersion` en
  `utils/legal.ts`.

# Relacionados

- [/legal/aviso-privacidad.md](/legal/aviso-privacidad.md)
- [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md)
