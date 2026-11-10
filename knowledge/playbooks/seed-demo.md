---
type: Playbook
title: Semilla demo (usuarios + donaciones)
description: Carga ~120 donantes ficticios y ~1000 donaciones para probar panel e historial.
tags: [playbook, dev, seed]
timestamp: 2026-11-04T00:00:00Z
---

# Trigger

Probar listados admin, ficha de donante, cola SPEI, alertas UMA y historial con volumen ficticio.

# Steps

1. `npm run db:setup` (o al menos migraciones + `npm run db:seed` para campañas).
2. `npm run db:seed-demo`
3. Login donante: `demo.donante.001@example.test` / `DemoTest123`
4. Panel: `/admin/donations`, `/admin/spei`, `/admin/alertas`, `/admin/users`

Recrear desde cero (borra solo correos `demo.donante.*@example.test`):

```bash
npm run db:seed-demo -- --force
```

# Qué inserta

| Pieza | Cantidad |
|-------|----------|
| Donantes | 120 (`demo.donante.NNN@example.test`) |
| Donaciones | ~1000 (+ extras UMA en 5 cuentas) |
| Iglesias | Varias del fallback `server/data/churches.json` |
| Métodos / estados | SPEI, tarjeta, PayPal; paid / pending / failed / cancelled |

Contraseña compartida documentada solo para local. No ejecutar en producción ni con datos reales.

# Relacionado

[/playbooks/dev-bulk-contacts.md](/playbooks/dev-bulk-contacts.md) · [/playbooks/run-local.md](/playbooks/run-local.md)
