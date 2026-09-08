import { eq } from 'drizzle-orm'
import { paymentSettings } from '../database/schema'
import type { PaymentMode, PaymentProvider, PaymentSettings } from '~/types'
import { hasMercadoPagoCredentials, hasPayPalCredentials } from '../payments/config'

const DEFAULTS = {
  cardProvider: 'mercadopago' as PaymentProvider,
  mode: 'test' as PaymentMode,
  cardEnabled: false,
  paypalEnabled: false,
  speiManualEnabled: true,
}

function toSettings(row: typeof paymentSettings.$inferSelect): Omit<PaymentSettings, 'credentials'> {
  return {
    cardProvider: row.cardProvider,
    mode: row.mode,
    cardEnabled: row.cardEnabled,
    paypalEnabled: row.paypalEnabled,
    speiManualEnabled: row.speiManualEnabled,
    updatedAt: row.updatedAt.toISOString(),
  }
}

function withCredentials(base: Omit<PaymentSettings, 'credentials'>): PaymentSettings {
  return {
    ...base,
    credentials: {
      mercadopago: hasMercadoPagoCredentials(base.mode),
      paypal: hasPayPalCredentials(base.mode),
    },
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const db = useDatabase()
  const [row] = await db.select().from(paymentSettings).where(eq(paymentSettings.id, 1)).limit(1)

  if (row) return withCredentials(toSettings(row))

  const [created] = await db
    .insert(paymentSettings)
    .values({ id: 1, ...DEFAULTS })
    .onConflictDoNothing()
    .returning()

  if (created) return withCredentials(toSettings(created))

  const [again] = await db.select().from(paymentSettings).where(eq(paymentSettings.id, 1)).limit(1)
  if (!again) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudieron cargar las preferencias de cobro' })
  }
  return withCredentials(toSettings(again))
}

export interface PaymentSettingsInput {
  cardProvider?: PaymentProvider
  mode?: PaymentMode
  cardEnabled?: boolean
  paypalEnabled?: boolean
  speiManualEnabled?: boolean
}

export async function updatePaymentSettings(input: PaymentSettingsInput): Promise<PaymentSettings> {
  const current = await getPaymentSettings()

  const cardProvider = input.cardProvider ?? current.cardProvider
  if (cardProvider !== 'mercadopago') {
    throw createError({
      statusCode: 400,
      statusMessage: 'En v1 el proveedor de tarjeta debe ser MercadoPago',
    })
  }

  const mode = input.mode ?? current.mode
  if (mode !== 'test' && mode !== 'live') {
    throw createError({ statusCode: 400, statusMessage: 'Modo inválido' })
  }

  const cardEnabled = input.cardEnabled ?? current.cardEnabled
  const paypalEnabled = input.paypalEnabled ?? current.paypalEnabled
  const speiManualEnabled = input.speiManualEnabled ?? current.speiManualEnabled

  if (cardEnabled && !hasMercadoPagoCredentials(mode)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No puede habilitar tarjeta: faltan credenciales de MercadoPago en el entorno',
    })
  }
  if (paypalEnabled && !hasPayPalCredentials(mode)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No puede habilitar PayPal: faltan credenciales en el entorno',
    })
  }

  const db = useDatabase()
  const [row] = await db
    .update(paymentSettings)
    .set({
      cardProvider,
      mode,
      cardEnabled,
      paypalEnabled,
      speiManualEnabled,
      updatedAt: new Date(),
    })
    .where(eq(paymentSettings.id, 1))
    .returning()

  if (!row) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudieron guardar las preferencias de cobro' })
  }

  return withCredentials(toSettings(row))
}
