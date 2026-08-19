---
type: Reference
title: Inventario de datos personales
description: Qué dato se recaba, dónde vive, con qué finalidad, base legal y plazo de conservación.
resource: server/database/schema.ts
tags: [privacy, lfpdppp, pii, compliance]
timestamp: 2026-08-19T00:00:00Z
---

# Para qué sirve

Es la evidencia de cumplimiento que sostiene el aviso de privacidad. Si se agrega, quita o
cambia un dato personal, este inventario se actualiza en el mismo trabajo.

# Responsable

`IGLESIA UNIVERSAL DEL REINO DE DIOS OFES, A.R.` Identidad, domicilio y buzón de contacto viven
en `utils/legal.ts` (`LEGAL`). El domicilio sigue pendiente de confirmar con el área jurídica.

# Datos sensibles

Donar o registrarse en este sitio revela **creencias religiosas**, categoría sensible según la
LFPDPPP. Consecuencias operativas:

- Exige consentimiento expreso, no tácito. Ver [/decisions/consentimiento-datos-sensibles.md](/decisions/consentimiento-datos-sensibles.md).
- El aviso debe declararlo expresamente (sección 3 de `pages/privacidad/index.vue`).
- Las sanciones se duplican, así que el acceso se restringe al mínimo.

# Inventario

| Dato | Dónde vive | Finalidad | Base | Conservación |
|------|------------|-----------|------|--------------|
| Correo | `users.email` | Identificador de cuenta, contacto | Necesaria | Cuenta activa |
| Nombre | `users.name` | Trato personal, comprobantes | Necesaria | Cuenta activa |
| Contraseña (hash scrypt) | `users.password_hash` | Autenticación | Necesaria | Cuenta activa |
| Rol | `users.role` | Control de acceso al panel | Necesaria | Cuenta activa |
| Teléfono | `donor_profiles.phone` / `phone_digits` | Contacto y unicidad | Necesaria | Cuenta activa |
| RFC | `donor_profiles.rfc` | Emitir CFDI | Opcional (solo con recibo) | 5 años tras el CFDI |
| Domicilio (calle, ciudad, estado, C.P.) | `donor_profiles.*` | Emitir CFDI | Opcional (solo con recibo) | 5 años tras el CFDI |
| Preferencia de recibo | `donor_profiles.wants_receipt` | Decidir si se piden datos fiscales | Necesaria | Cuenta activa |
| Donativo (iglesia, campaña, monto, método, estado) | `donations.*` | Registrar y conciliar el aporte | Necesaria + obligación contable | Permanente, sin vínculo al titular tras la baja |
| Consentimiento (tipo, versión, fecha) | `consents.*` | Probar que el consentimiento se otorgó | Obligación del responsable | 5 años |
| Huella de IP | `consents.ip_hash` | Evidencia del consentimiento | Obligación del responsable | 5 años |
| Navegador | `consents.user_agent` | Evidencia del consentimiento | Obligación del responsable | 5 años |
| Coordenadas del dispositivo | Solo en memoria y `sessionStorage` | Ordenar el directorio por cercanía | Opcional (permiso del navegador) | No se persiste en la base |

# Almacenamiento en el navegador

No hay cookies de aplicación, analítica ni píxeles de terceros. Solo `sessionStorage`:

| Clave | Contenido | Vida |
|-------|-----------|------|
| `auth-user` | Token, id, nombre, correo, rol | Hasta cerrar sesión o la pestaña |
| `donation-church` | Iglesia seleccionada | Hasta cerrar la pestaña |
| `churches:{lat}:{lng}` | Caché del directorio | 15 minutos |

# Salidas hacia terceros

| Destino | Qué sale | Nota |
|---------|----------|------|
| `universal.org.mx` (directorio WP) | Solo latitud y longitud | Nunca correo, nombre, teléfono ni RFC |
| Imágenes de iglesias | Petición del navegador a URLs externas | Expone IP y referer del visitante |

No hay pasarela de pago ni correo transaccional implementados. Si se agregan, hay que declararlos
en el aviso y subir `LEGAL.noticeVersion`.

# Nunca se expone en API

`password_hash`, `phone_digits`, `ip_hash`. Las respuestas admin tampoco incluyen teléfono,
domicilio ni RFC.

# Relacionados

- [/security/data-retention.md](/security/data-retention.md)
- [/data/consents-table.md](/data/consents-table.md)
- [/playbooks/arco-request.md](/playbooks/arco-request.md)
- [/data/field-limits.md](/data/field-limits.md)
