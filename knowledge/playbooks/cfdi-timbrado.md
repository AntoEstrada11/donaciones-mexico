---
type: Playbook
title: Timbrar CFDI de donativos
description: Requisitos PAC/CSD y estado del código (solicitud vs constancia HTML).
tags: [playbook, cfdi, fiscal, pac]
timestamp: 2026-10-23T00:00:00Z
---

# Trigger

Emitir factura CFDI 4.0 cuando el donante pidió recibo y la donación está `paid`.

# Qué hay hoy en el código

- Captura fiscal en perfil/donación (RFC, razón social, C.P., régimen, uso).
- Constancia HTML en `GET /api/donations/:id/receipt` (no es CFDI).
- Tabla `cfdi_invoices` + `POST /api/donations/:id/invoice`.
- Si faltan `NUXT_CFDI_PAC_API_URL` / `NUXT_CFDI_PAC_API_KEY` → 503 `PAC_NOT_CONFIGURED`.

# Qué necesita la Iglesia (operativo / jurídico)

1. **CSD del SAT** (certificado `.cer` + llave `.key` + contraseña) a nombre del RFC emisor.
2. Contrato con un **PAC** autorizado (Facturama, Finkok, SW Sapien, etc.).
3. Datos de emisor: RFC, razón social, régimen, domicilio fiscal (alineado al aviso).
4. Declarar el PAC como encargado en el aviso de privacidad y subir `LEGAL.noticeVersion`.
5. Variables de entorno del PAC (y almacenamiento MinIO `cfdi/{userId}/` para XML/PDF).
6. Conservación 5 años (Art. 30 CFF).

# Flujo objetivo

1. Donación `paid` + perfil con `wants_receipt` + INE completo.
2. `POST /api/donations/:id/invoice` → arma CFDI 4.0 → PAC timbra → guarda UUID, XML/PDF.
3. Donante descarga desde historial.

# Relacionado

[/decisions/captura-progresiva.md](/decisions/captura-progresiva.md) ·
[/playbooks/minio-private-storage.md](/playbooks/minio-private-storage.md)
