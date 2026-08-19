export default defineNuxtConfig({
  compatibilityDate: '2025-07-06',
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Donaciones — Iglesia Universal México',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Plataforma de donaciones en línea para la Iglesia Universal del Reino de Dios en México.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
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
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || 'dev-secret-change-me',
    databaseUrl: process.env.DATABASE_URL || '',
    churchesApiUrl: process.env.NUXT_CHURCHES_API_URL || 'https://miembros.iurdsys.net/api/churches',
    /** Solo servidor; nunca en runtimeConfig.public */
    churchesApiKey: process.env.NUXT_CHURCHES_API_KEY || '',
    churchesApiAllowedHost: process.env.NUXT_CHURCHES_API_ALLOWED_HOST || 'miembros.iurdsys.net',
    churchesCacheTtlMs: Number(process.env.NUXT_CHURCHES_CACHE_TTL_MS || 3_600_000),
    public: {
      defaultLatitude: 19.392531016453,
      defaultLongitude: -99.18114903857942,
    },
  },
})
