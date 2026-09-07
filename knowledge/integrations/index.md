# Integraciones

Pasarelas y terceros de cobro. El contrato interno vive en `server/payments/` (cuando se implemente); aquí se documenta el alcance acordado.

## Vigentes (v1 — diseño aceptado; código pendiente)

* [MercadoPago](mercadopago.md) - Proveedor principal de tarjeta (Checkout Pro + webhooks).
* [PayPal](paypal.md) - Método adicional (Orders v2 CAPTURE + webhooks).

## Fase 2 (no en v1)

* Stripe — Checkout Session alojado; webhook `Stripe-Signature`. Ver [/decisions/pasarela-provider-agnostica.md](/decisions/pasarela-provider-agnostica.md).
* Openpay (BBVA) — SPEI de comisión fija / ticket alto; mismo puerto de adaptadores.

SPEI directo (CLABE institucional) no es pasarela: [/data/spei-bank.md](/data/spei-bank.md).
