# APIs

* [POST /api/auth/register](auth-register.md) - Alta de cuenta (validación de correo/contraseña).
* [POST /api/auth/login](auth-login.md) - Login y emisión de token.
* [GET /api/me](me-get.md) - Perfil del donante autenticado.
* [PATCH /api/me](me-patch.md) - Actualización de perfil con formatos MX y unicidad.
* [GET /api/campaigns](campaigns-get.md) - Campañas activas.
* [GET /api/donations](donations-get.md) - Historial del donante (requiere sesión).
* [POST /api/donations](donations-post.md) - Alta de donación (monto $1–$999,999.99).
* [GET /api/hero-slides](hero-slides-get.md) - Slides activas del carrusel del home.
* [GET /api/churches](churches-get.md) - Directorio (proxy WP + fallback de muestra).
* [Admin API](admin.md) - Stats, slides, donaciones y usuarios (requireAdmin).
* [Iglesias (externa)](churches-external.md) - API WordPress IURD MX consultada por Nitro.

Límites compartidos: [/data/field-limits.md](/data/field-limits.md).
