# Datos

* [Esquema PostgreSQL](postgres-schema.md) - Fuente de verdad de donantes y donaciones.
* [Restricciones de formularios](field-limits.md) - Límites y formatos de campos en UI y API.
* [Semilla de campañas](campaigns-json.md) - JSON de arranque para la tabla `campaigns`.
* [Datos bancarios SPEI](spei-bank.md) - CLABE y beneficiario usados en `/spei` y el pie.
* [Iglesias de muestra](churches-json.md) - JSON de ejemplo y fallback si WordPress no responde.

El store anterior en `server/data/users.json` quedó obsoleto el 2026-08-06. Su migración está documentada en [/playbooks/db-migrations.md](/playbooks/db-migrations.md).
