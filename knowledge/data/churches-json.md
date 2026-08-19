---
type: Data File
title: Iglesias de muestra (plan B)
description: Snapshot local del catálogo Odoo (~253 templos) usado si la API remota no responde.
resource: server/data/churches.json
tags: [data, churches, fallback]
timestamp: 2026-08-19T00:00:00Z
---

# Ubicación

- Path en repo: `server/data/churches.json`
- Generador: `npm run db:sync-churches` (`server/database/sync-churches-fallback.ts`)

# Formato

Array de `Church` con ids **reales de Odoo** (string numérico, p. ej. `"6"`), no ids inventados
(`chr-001`). Incluye `latitude`, `longitude`, `imageUrl`, `googleUrl` y `alias` cuando Odoo los
provee. **No incluye `distance`**: en plan B el listado va ordenado alfabéticamente por nombre.

# Cuándo se usa

`GET /api/churches` intenta Odoo primero. Si falla (timeout, HTTP error, JSON inválido), Nitro lee
este archivo y responde `source: sample`. La UI en `/iglesias` muestra un aviso ámbar pero permite
seguir donando.

# Regenerar el snapshot

Ejecutar **con Odoo disponible** y `.env` con `NUXT_CHURCHES_API_URL` / `NUXT_CHURCHES_API_KEY`:

```bash
npm run db:sync-churches
```

Conviene hacerlo:

- Antes de un despliegue importante o del apagado de WordPress/Odoo intermitente.
- Tras altas o cambios masivos en el directorio de templos.
- Incluir el JSON actualizado en el commit de release.

El script descarga el catálogo completo, aplica `mapChurch`, ordena por nombre y sobrescribe el
archivo. No escribe secretos.

# Limitaciones del plan B

- Las fotos siguen apuntando a `miembros.iurdsys.net`; si Odoo cae por completo, las imágenes
  remotas pueden no cargar aunque el listado sí.
- Sin distancia por cercanía (no hay reorden dinámico por geolocalización).
- Los datos envejecen hasta la próxima sincronización manual.

Fuente primaria en runtime: [/apis/churches-external.md](/apis/churches-external.md) · contrato Nitro:
[/apis/churches-get.md](/apis/churches-get.md).
