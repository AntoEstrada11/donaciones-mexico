---
type: Decision
title: Datos fiscales solo bajo demanda
description: RFC y domicilio se piden únicamente si el donante activa el recibo deducible, y se borran si lo desactiva.
tags: [privacy, lfpdppp, cfdi, minimization]
timestamp: 2026-08-19T00:00:00Z
---

# Contexto

El perfil pedía RFC, calle, ciudad, estado y código postal a todos los donantes. La organización
todavía **no emite CFDI**, aunque planea hacerlo. Es decir, se recababa un bloque de datos
fiscales sin ninguna finalidad activa que los justificara.

La ley exige que el tratamiento sea el necesario, adecuado y relevante para las finalidades
declaradas en el aviso.

# Decisión

Los datos fiscales se vuelven condicionales:

- Nueva columna `donor_profiles.wants_receipt`, por omisión `false`.
- El bloque fiscal en `/perfil` solo aparece si el donante activa *«Quiero recibir un recibo
  deducible de impuestos»*.
- El servidor valida RFC y C.P. **solo** cuando `wantsReceipt` es verdadero.
- Al desactivar el interruptor, `updateDonorProfile` escribe `null` en calle, ciudad, estado, C.P.
  y RFC. Ocultar el campo sin borrar el dato no sería minimización.
- `profileComplete` sigue dependiendo únicamente de nombre y teléfono, así que no exige datos
  fiscales para considerarse completo.

# Alternativas descartadas

| Opción | Por qué no |
|--------|-----------|
| Quitar los campos por completo | La organización planea emitir CFDI; habría que reconstruirlos |
| Dejarlos visibles pero opcionales | La gente los llena de todos modos; se recaba lo que no se usa |
| Ocultarlos sin borrar el dato guardado | Conserva datos sin finalidad activa |

# Consecuencias

- Menos datos sensibles a la vista en caso de una vulneración.
- Cuando la organización obtenga la autorización para recibir donativos deducibles, el mecanismo
  ya está listo: solo hay que conectar la emisión del CFDI.
- A partir de que se emita un CFDI, esos datos quedan sujetos a los 5 años del Art. 30 del CFF y ya
  no se pueden borrar al desactivar el interruptor. Habrá que ajustar el borrado para respetar la
  obligación legal. Ver [/security/data-retention.md](/security/data-retention.md).

# Relacionados

- [/data/personal-data-inventory.md](/data/personal-data-inventory.md)
- [/apis/me-patch.md](/apis/me-patch.md)
- [/data/postgres-schema.md](/data/postgres-schema.md)
