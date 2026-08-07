---
type: Decision
title: Auth local Option A
description: Usuarios en server/data/users.json con scrypt y token HMAC Bearer. Superada parcialmente.
tags: [decision, auth, superseded]
status: superseded
superseded_by: /decisions/postgres-datos-propios.md
timestamp: 2026-08-06T00:00:00Z
---

> **Superada el 2026-08-06** en lo referente al almacenamiento. El esquema criptográfico (scrypt + token HMAC firmado con `NUXT_AUTH_SECRET`) sigue vigente; lo que cambió es que las cuentas viven en la tabla `users` de PostgreSQL. Ver [/decisions/postgres-datos-propios.md](/decisions/postgres-datos-propios.md).

# Contexto

Se necesitaba login y registro rápidos sin proveedor de auth externo ni usuarios de Odoo.

# Decisión

Archivo JSON local (`users.json`, fuera de git), contraseñas con scrypt y sesión firmada con `NUXT_AUTH_SECRET`.

# Consecuencias

- **+** Simple de operar en un solo nodo, sin dependencia externa.
- **−** No escalaba a varias instancias sin almacenamiento compartido.

# Por qué se abandonó el almacenamiento en archivo

Cada operación leía y reescribía el archivo completo, así que la unicidad de correo y teléfono se comprobaba en JavaScript entre la lectura y la escritura. Dos altas simultáneas podían duplicar un correo o perder un registro. Esas invariantes ahora las sostiene la base con restricciones `UNIQUE`.

# Lo que sigue pendiente

El token propio no es un JWT estándar ni viaja en cookie `HttpOnly`; vive en `sessionStorage`. Ver limitaciones en [/security/layers.md](/security/layers.md).
