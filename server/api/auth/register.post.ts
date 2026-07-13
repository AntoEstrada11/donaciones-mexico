import type { AuthResponse } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = normalizeEmail(String(body?.email || ''))
  const password = String(body?.password || '')
  const name = String(body?.name || '').trim() || email.split('@')[0] || 'Donante'

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Correo y contraseña son requeridos',
    })
  }

  if (!email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ingrese un correo válido',
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La contraseña debe tener al menos 6 caracteres',
    })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Este correo ya está registrado' })
  }

  // Contacto en Odoo (res.partner), sin usuario Odoo. El id de la app es el email.
  const odooPartnerId = await upsertOdooPartner({ name, email })

  const user = await createUser({
    id: email,
    email,
    name,
    passwordHash: hashPassword(password),
    odooPartnerId,
    profileComplete: false,
    createdAt: new Date().toISOString(),
  })

  const token = signToken({
    sub: user.email,
    email: user.email,
    name: user.name,
    odooPartnerId: user.odooPartnerId,
  })

  const response: AuthResponse = {
    token,
    name: user.name,
    email: user.email,
    odooPartnerId: user.odooPartnerId,
    profileComplete: user.profileComplete,
  }

  return response
})
