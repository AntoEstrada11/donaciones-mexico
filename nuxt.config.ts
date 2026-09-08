export default defineNuxtConfig({
  compatibilityDate: '2025-07-06',
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  // Dev: túneles (ngrok/cloudflare) envían Host distinto a localhost.
  // Sin esto, webhooks y retornos públicos responden 403 "host is not allowed".
  vite: {
    server: {
      allowedHosts: [
        '.ngrok-free.dev',
        '.ngrok-free.app',
        '.ngrok.io',
        '.trycloudflare.com',
      ],
    },
  },

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
    mpAccessTokenTest: process.env.NUXT_MP_ACCESS_TOKEN_TEST || '',
    mpAccessTokenLive: process.env.NUXT_MP_ACCESS_TOKEN_LIVE || '',
    mpWebhookSecretTest: process.env.NUXT_MP_WEBHOOK_SECRET_TEST || '',
    mpWebhookSecretLive: process.env.NUXT_MP_WEBHOOK_SECRET_LIVE || '',
    paypalClientIdTest: process.env.NUXT_PAYPAL_CLIENT_ID_TEST || '',
    paypalClientIdLive: process.env.NUXT_PAYPAL_CLIENT_ID_LIVE || '',
    paypalClientSecretTest: process.env.NUXT_PAYPAL_CLIENT_SECRET_TEST || '',
    paypalClientSecretLive: process.env.NUXT_PAYPAL_CLIENT_SECRET_LIVE || '',
    paypalWebhookIdTest: process.env.NUXT_PAYPAL_WEBHOOK_ID_TEST || '',
    paypalWebhookIdLive: process.env.NUXT_PAYPAL_WEBHOOK_ID_LIVE || '',
    /** Solo servidor: base HTTPS para webhooks (ngrok en local). */
    paymentWebhookBaseUrl: process.env.NUXT_PAYMENT_WEBHOOK_BASE_URL || '',
    public: {
      defaultLatitude: 19.392531016453,
      defaultLongitude: -99.18114903857942,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
    },
  },
})
