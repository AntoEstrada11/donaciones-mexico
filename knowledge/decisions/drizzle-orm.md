---
type: Decision
title: Drizzle como capa de acceso a datos
description: Se elige Drizzle ORM sobre Prisma o SQL directo para el servidor Nitro.
tags: [decision, drizzle, orm]
status: accepted
timestamp: 2026-08-06T00:00:00Z
---

# Contexto

Al adoptar PostgreSQL había que decidir cómo hablarle desde las rutas de Nitro: SQL directo con el driver, un query builder, o un ORM completo.

# Decisión

Drizzle ORM con el driver `postgres`, y `drizzle-kit` para generar migraciones SQL versionadas.

# Consecuencias

- **+** TypeScript puro, sin binarios ni motor de queries aparte: el output de Nitro sigue siendo ligero de desplegar.
- **+** Los tipos salen del esquema, así que un cambio de columna rompe la compilación y no la producción.
- **+** Soporta PostgreSQL, MySQL y SQLite, de modo que la decisión de motor no queda amarrada de forma irreversible.
- **+** Genera SQL legible que se revisa antes de aplicarlo y se commitea junto al cambio de esquema.
- **−** Migraciones menos automáticas que en Prisma: un renombre de columna puede salir como `DROP` + `ADD` si no se revisa.
- **−** Los errores del driver vienen envueltos, así que detectar una violación de unicidad exige recorrer la cadena de causas (`findPgError` en `server/utils/users.ts`).

# Convenciones adoptadas

- Los repositorios viven en `server/utils/` y son lo único que conoce el esquema; las rutas de `server/api/` no arman queries.
- Las columnas `NUMERIC` se convierten a número en la frontera del repositorio, no en las páginas.
- Toda escritura que toca dos tablas va dentro de una transacción.

# Cuándo reconsiderar

Si el equipo crece y se prefiere una herramienta con más automatismo en migraciones y un studio visual maduro, Prisma es la alternativa natural.
