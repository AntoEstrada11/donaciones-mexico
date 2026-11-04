/// <reference types="node" />
export default defineNuxtConfig({
  compatibilityDate: '2025-07-06',
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  // Dev: teléfono / túnel HTTPS (cámara exige contexto seguro fuera de localhost).
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  vite: {
    server: {
      allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io', '.ngrok.app'],
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
    /** Solo servidor: base HTTPS pública de webhooks. Si falta, se usa NUXT_PUBLIC_SITE_URL. */
    paymentWebhookBaseUrl: process.env.NUXT_PAYMENT_WEBHOOK_BASE_URL || '',
    /** MinIO / S3: bucket privado (INE, futuros CFDI). Nunca en runtimeConfig.public. */
    minioEndpoint: process.env.NUXT_MINIO_ENDPOINT || '',
    minioAccessKey: process.env.NUXT_MINIO_ACCESS_KEY || '',
    minioSecretKey: process.env.NUXT_MINIO_SECRET_KEY || '',
    minioBucketPrivate: process.env.NUXT_MINIO_BUCKET_PRIVATE || 'donaciones-private',
    minioRegion: process.env.NUXT_MINIO_REGION || 'us-east-1',
    /** Secreto AES-GCM de objetos; si vacío se usa authSecret. */
    minioObjectSecret: process.env.NUXT_MINIO_OBJECT_SECRET || '',
    smtpHost: process.env.NUXT_SMTP_HOST || '',
    smtpPort: Number(process.env.NUXT_SMTP_PORT || 587),
    smtpUser: process.env.NUXT_SMTP_USER || '',
    smtpPass: process.env.NUXT_SMTP_PASS || '',
    smtpFrom: process.env.NUXT_SMTP_FROM || '',
    smtpSecure: process.env.NUXT_SMTP_SECURE === 'true',
    /** En local, APIs pueden devolver el enlace si no hay SMTP. */
    mailDevReturnLink: process.env.NUXT_MAIL_DEV_RETURN_LINK === 'true',
    /** PAC de timbrado CFDI (vacío = no configurado). */
    cfdiPacApiUrl: process.env.NUXT_CFDI_PAC_API_URL || '',
    cfdiPacApiKey: process.env.NUXT_CFDI_PAC_API_KEY || '',
    public: {
      defaultLatitude: 19.392531016453,
      defaultLongitude: -99.18114903857942,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      authHubUrl: process.env.NUXT_PUBLIC_AUTH_HUB_URL || '',
      appCode: process.env.NUXT_PUBLIC_APP_CODE || 'donaciones',
    },
  },
})
