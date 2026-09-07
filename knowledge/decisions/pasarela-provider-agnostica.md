---
type: Decision
title: Pasarela provider-agnóstica
description: Puerto interno de cobros con adaptadores por proveedor; MercadoPago principal y PayPal en v1.
tags: [decision, payments, architecture]
status: accepted
timestamp: 2026-09-07T00:00:00Z
---

# Contexto

`POST /api/donations` solo crea filas `pending`. No hay cobro real ni IDs externos. El negocio necesita tarjeta y PayPal, poder cambiar de proveedor ante incidente o contrato, y no reescribir el sitio por cada pasarela. Una evaluación previa (PDF) también contempló Stripe y Openpay.

# Decisión

Arquitectura **puerto interno + adaptadores**:

1. La app habla un contrato estable (`createCheckout`, `verifyWebhook`, `parseWebhook`, `fetchStatus`).
2. Cada proveedor es un adaptador en `server/payments/<proveedor>.ts`.
3. El admin elige el proveedor de tarjeta activo y el modo `test`/`live` en `payment_settings` (sin secretos).
4. Los cobros **nuevos** usan el proveedor activo; los `pending`/suscripciones ya abiertas siguen en el proveedor que las creó.

# Alcance v1 vs fase 2

| Fase | Proveedores | Producto |
|------|-------------|---------|
| **v1** | MercadoPago (principal), PayPal | Donación **única**, checkout alojado |
| **Fase 2** | Stripe, Openpay (+ recurrencia MP/PayPal) | Suscripciones; SPEI de comisión fija vía Openpay si aplica |

Stripe y Openpay **no** se implementan en v1. El diseño los admite después: un archivo adaptador + credenciales en env + valor en `paymentProviderEnum` + opción en el selector admin.

# Consecuencias

- **+** Cambio operativo (incidente o contrato) sin reescribir donaciones, historial ni consentimiento.
- **+** SPEI CLABE del pie (`site_settings`) sigue siendo transferencia directa (`spei_manual`), independiente de la pasarela.
- **−** Cada proveedor nuevo exige un adaptador y pruebas de webhook propias.
- **−** Las mensualidades tokenizadas en A no migran a B con un selector; hay que cancelar y re-capturar.

# Relacionado

[/decisions/checkout-hospedado-pci.md](/decisions/checkout-hospedado-pci.md) · [/integrations/](/integrations/) · [/roadmap.md](/roadmap.md)
