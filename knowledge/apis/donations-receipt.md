---
type: API Endpoint
title: GET /api/donations/:id/receipt
description: Constancia HTML de donativo pagado; no es CFDI SAT.
resource: /api/donations
tags: [api, donations]
timestamp: 2026-09-14T00:00:00Z
---

# Contrato

- **Auth:** Bearer donante dueño de la donación
- **Requisitos:** `status=paid`, `wantsReceipt`, RFC y INE anverso+reverso
- **Respuesta:** HTML descargable; texto aclara que no está timbrado
