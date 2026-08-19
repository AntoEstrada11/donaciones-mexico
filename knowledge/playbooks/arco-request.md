---
type: Playbook
title: Atender una solicitud ARCO
description: Procedimiento y plazos para responder acceso, rectificación, cancelación u oposición.
tags: [privacy, lfpdppp, arco, compliance]
timestamp: 2026-08-19T00:00:00Z
---

# Trigger

Llega a `donaciones@mx.universal.org` (buzón declarado en `LEGAL.correoArco`) una solicitud de
acceso, rectificación, cancelación u oposición, o una revocación de consentimiento.

# Plazos (días hábiles)

| Etapa | Plazo |
|-------|-------|
| Responder al titular | 20 |
| Prórroga, una sola vez y con causa justificada | +20 |
| Hacer efectivo el derecho una vez aceptado | 10 |

**Anota la fecha de recepción el mismo día.** El reloj corre desde ahí y el incumplimiento es
sancionable por la Secretaría Anticorrupción y Buen Gobierno.

# Steps

1. **Acusa recibo** el mismo día, con la fecha de recepción y el plazo de respuesta.
2. **Verifica identidad.** Pide identificación oficial y que el correo remitente coincida con el
   registrado. Sin acreditar identidad no se entrega ni se modifica nada.
3. **Clasifica el derecho** y resuelve:

| Derecho | Cómo resolver |
|---------|---------------|
| Acceso | Pide que use *Descargar mis datos* en `/perfil`. Si no tiene cuenta o no puede, genera la salida de `GET /api/me/export` y envíasela por un canal seguro |
| Rectificación | Que edite en `/perfil`. Si no puede, corrige con `PATCH /api/me` o en base tras verificar identidad |
| Cancelación | Que use *Eliminar mi cuenta* en `/perfil`. Si no puede, ejecuta la baja tras verificar identidad |
| Oposición / revocación | Desactivar comunicaciones en `/perfil`, o `POST /api/me/consents` con `granted: false` |

4. **Si procede parcialmente**, explica qué datos se conservan y por qué. El caso típico es el
   respaldo contable de un donativo: se bloquea, no se usa, y se elimina al cumplirse el plazo de
   [/security/data-retention.md](/security/data-retention.md).
5. **Responde por escrito** dentro de los 20 días hábiles, aunque la respuesta sea negativa, e
   indica el motivo y el fundamento.
6. **Archiva** la solicitud, la identificación, la respuesta y la fecha de cada etapa.

# Causales para negar

- No se acredita la identidad o la representación.
- Los datos no obran en nuestras bases.
- Se lesionarían derechos de un tercero.
- Existe impedimento legal o una obligación de conservar el dato.
- La rectificación o cancelación ya se hizo antes.

Negar sin fundamento es lo que dispara sanciones. Si hay duda, consulta al área jurídica antes de
que venza el plazo.

# Verificación de que el autoservicio funciona

Con sesión iniciada, en `/perfil` deben existir y responder: descarga de datos, interruptor de
comunicaciones y eliminación de cuenta con confirmación por contraseña.

# Notas

- La autoridad ya no es el INAI. Cualquier plantilla que lo mencione está desactualizada.
- Si la solicitud llega por teléfono, pide que la envíe por escrito al buzón y registra la fecha.

# Relacionados

- [/apis/me-export.md](/apis/me-export.md)
- [/apis/me-delete.md](/apis/me-delete.md)
- [/apis/me-consents.md](/apis/me-consents.md)
- [/playbooks/data-breach.md](/playbooks/data-breach.md)
