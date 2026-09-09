---
type: Playbook
title: Personalizar pie y carrusel
description: JSON de site_settings y especificaciones de imagen del hero. No es un archivo que se sube; el pie se guarda con PATCH.
tags: [admin, personalize, hero]
timestamp: 2026-09-09T00:00:00Z
---

# Pie de página (contacto y SPEI)

No hay carga de JSON en el panel. El admin edita `/admin/personalizar/pie` o `PATCH /api/admin/site-settings` con este cuerpo:

```json
{
  "contactPhone": "55 86 64 51 01",
  "contactEmail": "donaciones@mx.universal.org",
  "speiBank": "Banco Azteca",
  "speiBeneficiary": "IGLESIA UNIVERSAL DEL REINO DE DIOS OFES A.R.",
  "speiClabe": "127180001112050753",
  "speiConcept": "Donativo"
}
```

| Campo | Regla |
|-------|--------|
| `contactPhone` | 10–15 dígitos |
| `contactEmail` | correo válido, máx. 255 |
| `speiBank` | máx. 120 |
| `speiBeneficiary` | máx. 200 |
| `speiClabe` | exactamente 18 dígitos |
| `speiConcept` | máx. 80 |

Semilla: `utils/siteSettingsDefaults.ts`. Tipos de donación (diezmo, ofrenda, etc.) salen de `server/data/campaigns.json` + `npm run db:seed`, no del pie.

# Carrusel (hero)

Subir en `/admin/personalizar/carrusel` (multipart `file` + `alt`). Copiar JPG a disco **no** crea la slide.

| Spec | Valor |
|-------|--------|
| Formatos | JPEG, PNG o WebP |
| Peso | máximo 3 MB |
| Texto alt | máx. 160 caracteres |
| Uso en home | `object-cover` a pantalla completa; se recorta si no encaja |
| Tamaño recomendado | **1920 × 800 px** (horizontal). 16:9 (1920×1080) también sirve; el recorte es desde el centro vertical |
| Motivo | El bloque del hero es ancho y más bajo que 16:9; caras y texto del diseño deben ir al centro |

# Relacionado

[/playbooks/hero-slides-restore.md](/playbooks/hero-slides-restore.md) · [/data/spei-bank.md](/data/spei-bank.md)
