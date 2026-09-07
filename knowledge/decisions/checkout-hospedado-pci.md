---
type: Decision
title: Checkout alojado y secretos en env
description: Redirect a checkout del proveedor (SAQ-A) y llaves solo en variables de entorno.
tags: [decision, payments, pci, security]
status: accepted
timestamp: 2026-09-07T00:00:00Z
---

# Contexto

Integrar tarjeta implica alcance PCI-DSS. Formulario embebido (Bricks / Card Fields) da más control visual pero más responsabilidad. Guardar access tokens en una tabla editable por admin aumenta la superficie si el panel lo usan varios operadores.

# Decisión

1. **Checkout alojado (redirect):** MercadoPago Checkout Pro (Preference → `init_point`) y PayPal Orders v2 (enlace `approve`). El sitio **no** toca PAN ni CVV → objetivo SAQ-A.
2. **Secretos solo en env/host:** `NUXT_MP_*`, `NUXT_PAYPAL_*` (juegos test y live). El panel admin muestra «configurado / faltante», elige proveedor y modo, y no guarda ni reenvía secretos.
3. **Monto en servidor:** el cobro toma `amount` de la fila `donations`; el cliente nunca dicta el importe al proveedor. `external_reference` / `custom_id` = `donation.id`.

# Consecuencias

- **+** Menor alcance PCI y menos riesgo de filtrar llaves vía API admin.
- **+** El donante sale del sitio al pagar y vuelve a `/donaciones/gracias`; el estado definitivo llega por webhook firmado.
- **−** Menos personalización visual del formulario de tarjeta.
- **−** Rotar llaves requiere acceso al host / `.env`, no solo el panel.

# Relacionado

[/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md) · [/security/layers.md](/security/layers.md)
