---
type: Reference
title: Plazos de conservación
description: Cuánto se guarda cada dato personal y qué se conserva pese a una baja de cuenta.
resource: utils/legal.ts
tags: [privacy, lfpdppp, retention, compliance]
timestamp: 2026-08-19T00:00:00Z
---

# Por qué existe

La LFPDPPP vigente desde el 21/03/2025 incorporó el **plazo de conservación** como requisito del
aviso de privacidad. Los plazos declarados aquí deben coincidir con los de
`pages/privacidad/index.vue` sección 6 y con `RETENTION` en `utils/legal.ts`.

# Plazos

| Dato | Plazo | Motivo |
|------|-------|--------|
| Cuenta, nombre, correo, teléfono | Mientras la cuenta esté activa | Prestación del servicio |
| Datos fiscales (RFC, domicilio) | 5 años desde el CFDI | Art. 30 del Código Fiscal de la Federación |
| Datos fiscales sin CFDI emitido | Se borran al desactivar el recibo deducible | Minimización |
| Donaciones | Permanente, desvinculadas del titular tras la baja | Obligación contable |
| Consentimientos | 5 años | Evidencia de que se otorgó |
| Coordenadas | No se persisten | Solo memoria y caché de sesión del navegador |

# Qué pasa al dar de baja una cuenta

`DELETE /api/me` borra la fila de `users`. El esquema hace el resto:

| Tabla | Efecto |
|-------|--------|
| `donor_profiles` | `ON DELETE CASCADE`: se elimina el perfil con teléfono, domicilio y RFC |
| `donations` | `ON DELETE SET NULL`: la donación queda sin titular |
| `consents` | `ON DELETE SET NULL`: la evidencia sobrevive anonimizada |

# Excepción por obligación legal

Cuando el sitio empiece a emitir CFDI, el respaldo contable del donativo no puede eliminarse antes
de los 5 años, aunque el titular ejerza cancelación. En ese caso el dato se **bloquea**: se
conserva sin usarse para ninguna otra finalidad y se le informa al titular en la respuesta a su
solicitud. Hoy no se emiten CFDI, así que la baja elimina todo lo eliminable.

# Al agregar un dato nuevo

Define su plazo en `RETENTION` de `utils/legal.ts`, decláralo en el aviso, y regístralo en
[/data/personal-data-inventory.md](/data/personal-data-inventory.md).

# Relacionados

- [/security/layers.md](/security/layers.md)
- [/playbooks/arco-request.md](/playbooks/arco-request.md)
- [/data/consents-table.md](/data/consents-table.md)
