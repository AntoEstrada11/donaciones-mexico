---
type: Playbook
title: Vulneración de datos personales
description: Contención, evaluación y notificación cuando se filtran o comprometen datos de donantes.
tags: [privacy, lfpdppp, security, incident]
timestamp: 2026-08-19T00:00:00Z
---

# Trigger

Cualquier indicio de que datos personales fueron accedidos, copiados, alterados o destruidos sin
autorización: base expuesta, credenciales filtradas, `NUXT_AUTH_SECRET` comprometido, respaldo
perdido, acceso indebido al panel admin, o un correo con datos enviado a quien no correspondía.

# Regla de oro

Los datos de este sitio son **sensibles** (creencias religiosas). Trata cualquier incidente como
grave hasta demostrar lo contrario.

# Steps

## 1. Contener (primeras horas)

1. Corta el acceso: rota `NUXT_AUTH_SECRET` (invalida todas las sesiones), rota la contraseña de
   PostgreSQL y revisa `DATABASE_URL`.
2. Revoca roles admin que no reconozcas: revisa `users.role` y `/admin/users`.
3. Si la base quedó accesible desde fuera, cierra el puerto. Solo debe publicarse en `127.0.0.1`.
4. **No borres logs ni evidencia.** Se necesitan para acreditar la respuesta.

## 2. Evaluar

Documenta por escrito:

- Qué datos se vieron afectados y de cuántas personas. Usa
  [/data/personal-data-inventory.md](/data/personal-data-inventory.md) como mapa.
- Si hubo datos sensibles o fiscales de por medio.
- Cuándo ocurrió, cuándo se detectó y por qué vía.
- Qué se hizo para contenerlo.

## 3. Notificar

Informa **sin demora** a los titulares afectados cuando la vulneración afecte de forma
significativa sus derechos patrimoniales o morales. La notificación debe decir, en lenguaje claro:

- Qué datos se comprometieron.
- Qué irregularidad ocurrió.
- Qué recomendaciones puede seguir el titular (por ejemplo, cambiar la contraseña si la reutiliza).
- Qué acciones correctivas se tomaron.
- Dónde obtener más información.

Avisa también al área jurídica y a la dirección de la organización el mismo día.

## 4. Corregir

1. Repara la causa raíz antes de restablecer el servicio.
2. Si se filtraron hashes de contraseña, obliga a cambiarla con
   [/playbooks/set-password.md](/playbooks/set-password.md) y avisa a los titulares.
3. Registra el incidente y las medidas adoptadas. Es la prueba de que se actuó con diligencia.

# Prevención permanente

- `NUXT_AUTH_SECRET` real en producción, nunca `dev-secret-change-me`.
- Puerto de PostgreSQL solo en `127.0.0.1`; respaldos cifrados y fuera del repositorio.
- Nunca registrar datos personales en logs; ver la regla `.cursor/rules/pii-handling.mdc`.
- Revisar periódicamente quién tiene rol admin.

# Relacionados

- [/security/layers.md](/security/layers.md)
- [/security/data-retention.md](/security/data-retention.md)
- [/playbooks/db-backup.md](/playbooks/db-backup.md)
