# APIs

* [POST /api/auth/register](auth-register.md) - Alta de cuenta (validación de correo/contraseña).
* [POST /api/auth/login](auth-login.md) - Login y emisión de token.
* [GET /api/me](me-get.md) - Perfil del donante autenticado.
* [PATCH /api/me](me-patch.md) - Actualización de perfil con formatos MX y unicidad.
* [DELETE /api/me](me-delete.md) - Baja de cuenta con contraseña (cancelación ARCO).
* [GET /api/me/export](me-export.md) - Copia descargable de los datos del titular (acceso ARCO).
* [GET y POST /api/me/consents](me-consents.md) - Estado y cambio de consentimientos.
* [GET /api/campaigns](campaigns-get.md) - Campañas activas.
* [GET /api/donations](donations-get.md) - Historial del donante (requiere sesión).
* [POST /api/donations](donations-post.md) - Alta de donación (monto $1–$999,999.99).
* [GET /api/hero-slides](hero-slides-get.md) - Slides activas del carrusel del home.
* [GET /api/site-settings](site-settings-get.md) - Contacto y SPEI del pie (públicos).
* [GET /api/churches](churches-get.md) - Directorio (proxy Odoo + fallback de muestra).
* [Admin API](admin.md) - Stats, slides, site-settings, donaciones y usuarios (requireAdmin).
* [Iglesias (externa Odoo)](churches-external.md) - API en miembros.iurdsys.net consultada por Nitro.

Límites compartidos: [/data/field-limits.md](/data/field-limits.md).

`POST /api/auth/register` y `POST /api/donations` exigen `consent: true` y devuelven `422` sin él. Cupos por IP: [/security/rate-limiting.md](/security/rate-limiting.md).
