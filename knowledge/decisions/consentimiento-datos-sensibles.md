---
type: Decision
title: Consentimiento expreso para datos sensibles
description: Casilla no premarcada más registro en base como mecanismo de autenticación del consentimiento.
tags: [privacy, lfpdppp, consent, auth]
timestamp: 2026-08-19T00:00:00Z
---

# Contexto

La LFPDPPP clasifica las **creencias religiosas** como dato personal sensible. Registrarse o donar
en un sitio de la Iglesia Universal las revela por inferencia directa, así que el sitio trata datos
sensibles aunque nunca pregunte por la religión de nadie.

La ley exige para esos datos consentimiento **expreso y por escrito**, mediante firma autógrafa,
firma electrónica «o cualquier mecanismo de autenticación que al efecto se establezca». Las
sanciones se duplican cuando hay datos sensibles.

# Decisión

El mecanismo de autenticación del consentimiento es la combinación de tres elementos:

1. **Casilla explícita y no premarcada** cuyo texto menciona los datos sensibles
   (`components/LegalConsent.vue`), enlazada al aviso integral.
2. **Validación en el servidor**: `POST /api/auth/register` y `POST /api/donations` devuelven `422`
   si el cuerpo no trae `consent: true`. La casilla del cliente por sí sola no es evidencia.
3. **Registro inmutable** en la tabla `consents` con la versión del aviso, la fecha, el navegador y
   una huella HMAC de la IP.

# Alternativas descartadas

| Opción | Por qué no |
|--------|-----------|
| Consentimiento tácito (solo enlazar el aviso en el pie) | La ley no lo admite para datos sensibles |
| Casilla premarcada | No es manifestación de voluntad; la ley exige acto positivo |
| Firma electrónica avanzada | Desproporcionado para donar y expulsaría a la mayoría de los donantes |
| No registrar la aceptación | Deja al responsable sin forma de probar el consentimiento |

# Consecuencias

- Sin consentimiento no hay cuenta ni donativo. Es un bloqueo intencional del flujo.
- Donar sin sesión también exige la casilla: la fila de `consents` se ata a `donation_id`.
- Las finalidades secundarias (comunicaciones) van en casilla separada y opcional. Negarlas no
  puede impedir donar.
- Cambiar las finalidades del tratamiento obliga a subir `LEGAL.noticeVersion` y a recabar
  consentimiento de nuevo: la nueva ley eliminó la excepción de «finalidades análogas o
  compatibles».

# Relacionados

- [/data/consents-table.md](/data/consents-table.md)
- [/data/personal-data-inventory.md](/data/personal-data-inventory.md)
- [/apis/auth-register.md](/apis/auth-register.md)
- [/apis/donations-post.md](/apis/donations-post.md)
