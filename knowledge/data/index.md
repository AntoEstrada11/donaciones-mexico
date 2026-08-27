# Datos

* [Esquema PostgreSQL](postgres-schema.md) - Fuente de verdad de donantes y donaciones.
* [Inventario de datos personales](personal-data-inventory.md) - Qué se recaba, finalidad, base legal y conservación.
* [Tabla consents](consents-table.md) - Evidencia append-only de consentimientos y revocaciones.
* [Restricciones de formularios](field-limits.md) - Límites y formatos de campos en UI y API.
* [Semilla de campañas](campaigns-json.md) - JSON de arranque para la tabla `campaigns`.
* [Datos bancarios SPEI y pie](spei-bank.md) - Contacto y SPEI en `site_settings` (editables en admin).
* [Iglesias de muestra (plan B)](churches-json.md) - Snapshot local (~253 templos) si Odoo no responde.

El store anterior en `server/data/users.json` quedó obsoleto el 2026-08-06. Su migración está documentada en [/playbooks/db-migrations.md](/playbooks/db-migrations.md).
