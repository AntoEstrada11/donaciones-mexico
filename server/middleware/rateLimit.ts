import type { RateLimitRule } from '../utils/rateLimit'

/** Rutas sensibles: crean cuenta, prueban credenciales o escriben datos personales. */
const RULES: Array<{ prefix: string, rule: RateLimitRule, methods?: string[] }> = [
  { prefix: '/api/auth/login', rule: { limit: 10, windowMs: 5 * 60_000 } },
  { prefix: '/api/auth/admin-login', rule: { limit: 10, windowMs: 5 * 60_000 } },
  { prefix: '/api/auth/register', rule: { limit: 5, windowMs: 15 * 60_000 } },
  { prefix: '/api/donations', rule: { limit: 20, windowMs: 5 * 60_000 } },
  { prefix: '/api/me', rule: { limit: 60, windowMs: 5 * 60_000 } },
  { prefix: '/api/auth/password-reset', rule: { limit: 10, windowMs: 15 * 60_000 }, methods: ['POST'] },
  { prefix: '/api/admin/users', rule: { limit: 60, windowMs: 5 * 60_000 } },
  { prefix: '/api/churches', rule: { limit: 60, windowMs: 5 * 60_000 }, methods: ['GET'] },
  { prefix: '/api/payments/checkout', rule: { limit: 20, windowMs: 5 * 60_000 }, methods: ['POST'] },
  { prefix: '/api/payments/paypal/capture', rule: { limit: 20, windowMs: 5 * 60_000 }, methods: ['POST'] },
  { prefix: '/api/payments/paypal-capture', rule: { limit: 30, windowMs: 5 * 60_000 }, methods: ['POST'] },
  { prefix: '/api/payments/mercadopago/sync', rule: { limit: 20, windowMs: 5 * 60_000 }, methods: ['POST'] },
  { prefix: '/api/dev/contacts', rule: { limit: 20, windowMs: 5 * 60_000 }, methods: ['POST'] },
  { prefix: '/api/webhooks', rule: { limit: 120, windowMs: 5 * 60_000 } },
]

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  const match = RULES.find(entry => path.startsWith(entry.prefix))
  if (!match) return

  if (match.methods && !match.methods.includes(event.method)) return

  // Las lecturas simples no consumen cupo; el objetivo son los envíos.
  if (event.method === 'GET' && match.prefix === '/api/me') return

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'desconocida'
  const { allowed, retryAfter } = consumeRateLimit(`${match.prefix}:${ip}`, match.rule)

  if (!allowed) {
    setHeader(event, 'retry-after', String(retryAfter))
    throw createError({
      statusCode: 429,
      statusMessage: 'Demasiados intentos. Espere unos minutos e intente de nuevo.',
    })
  }
})
