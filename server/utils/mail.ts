/**
 * Correo transaccional por SMTP (reset, verificación).
 * Nunca registra el destinatario ni el cuerpo con datos personales.
 */
import nodemailer from 'nodemailer'

export interface MailMessage {
  to: string
  subject: string
  text: string
  html: string
}

function mailConfig() {
  const c = useRuntimeConfig()
  return {
    host: String(c.smtpHost || '').trim(),
    port: Number(c.smtpPort || 587),
    user: String(c.smtpUser || '').trim(),
    pass: String(c.smtpPass || '').trim(),
    from: String(c.smtpFrom || '').trim(),
    secure: Boolean(c.smtpSecure),
  }
}

export function isMailConfigured(): boolean {
  const m = mailConfig()
  return Boolean(m.host && m.from && (m.user ? m.pass : true))
}

/**
 * Solo en desarrollo/local y con flag explícito.
 * En producción nunca se devuelve el enlace en JSON (aunque el flag esté mal puesto).
 */
export function mailDevReturnLink(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  return Boolean(useRuntimeConfig().mailDevReturnLink)
}

export async function sendMail(message: MailMessage): Promise<{ sent: boolean }> {
  if (!isMailConfigured()) {
    return { sent: false }
  }

  const m = mailConfig()
  const transport = nodemailer.createTransport({
    host: m.host,
    port: m.port,
    secure: m.secure || m.port === 465,
    auth: m.user ? { user: m.user, pass: m.pass } : undefined,
  })

  await transport.sendMail({
    from: m.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  })

  return { sent: true }
}

export function siteOriginFallback(eventOrigin?: string): string {
  const configured = String(useRuntimeConfig().public.siteUrl || '').trim().replace(/\/$/, '')
  if (configured) return configured
  return (eventOrigin || 'http://localhost:3000').replace(/\/$/, '')
}
