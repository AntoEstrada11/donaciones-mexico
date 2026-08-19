/**
 * Limitador de tasa en memoria por proceso. Cubre fuerza bruta y abuso básico,
 * que es una medida de seguridad exigible sobre datos personales.
 * En despliegues con varias instancias hay que sustituirlo por un store compartido.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Evita que el mapa crezca sin control con IPs que ya expiraron. */
function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitRule {
  /** Peticiones permitidas dentro de la ventana. */
  limit: number
  /** Tamaño de la ventana en milisegundos. */
  windowMs: number
}

export function consumeRateLimit(key: string, rule: RateLimitRule): { allowed: boolean, retryAfter: number } {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  bucket.count += 1

  if (bucket.count > rule.limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  return { allowed: true, retryAfter: 0 }
}
