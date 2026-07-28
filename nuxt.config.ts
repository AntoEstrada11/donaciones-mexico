export default defineNuxtConfig({
  compatibilityDate: '2025-07-06',
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@nuxtjs/supabase'],

  css: ['~/assets/css/main.css'],

  build: {
    transpile: ['@scalar/api-reference'],
  },

  vite: {
    optimizeDeps: {
      include: ['@scalar/api-reference'],
    },
  },

  app: {
    head: {
      title: 'Donaciones — Iglesia Universal México',
      htmlAttrs: { lang: 'es-MX' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Plataforma segura de donaciones en línea para la Iglesia Universal del Reino de Dios en México. Acceso con cuenta protegida y datos cifrados en tránsito.',
        },
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        { name: 'theme-color', content: '#003366' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  routeRules: {
    '/docs': { ssr: false },
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
      },
    },
  },

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    locales: [
      {
        code: 'es-MX',
        iso: 'es-MX',
        name: 'Español (México)',
        file: 'es-MX.json',
      },
    ],
    defaultLocale: 'es-MX',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: false,
  },

  supabase: {
    redirect: false,
    types: false,
  },

  runtimeConfig: {
    supabaseServiceKey:
      process.env.SUPABASE_SERVICE_KEY
      || process.env.NUXT_SUPABASE_SERVICE_KEY
      || process.env.NUXT_SUPABASE_SECRET_KEY
      || '',
    odooUrl: process.env.NUXT_ODOO_URL || '',
    odooDb: process.env.NUXT_ODOO_DB || '',
    odooUsername: process.env.NUXT_ODOO_USERNAME || '',
    odooPassword: process.env.NUXT_ODOO_PASSWORD || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      apiDocsEnabled: process.env.NUXT_PUBLIC_API_DOCS !== 'false',
      churchesApiUrl: 'https://universal.org.mx/wp-json/iurd/v1/churches',
      defaultLatitude: 19.392531016453,
      defaultLongitude: -99.18114903857942,
    },
  },
})
