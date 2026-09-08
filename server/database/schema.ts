import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const donationStatusEnum = pgEnum('donation_status', ['paid', 'pending', 'failed', 'cancelled', 'refunded'])
export const donationMethodEnum = pgEnum('donation_method', ['spei', 'card', 'paypal'])
export const paymentProviderEnum = pgEnum('payment_provider', ['mercadopago', 'paypal', 'spei_manual'])
export const paymentModeEnum = pgEnum('payment_mode', ['test', 'live'])
export const userRoleEnum = pgEnum('user_role', ['donor', 'admin'])
export const donorStatusEnum = pgEnum('donor_status', ['active', 'deactivated'])
export const consentTypeEnum = pgEnum('consent_type', ['privacy_notice', 'sensitive_data', 'marketing'])

/** Cuenta de acceso del donante. El correo es único pero puede cambiar, por eso la PK es sintética. */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('donor'),
  /** Solo aplica a donantes; los admin se consideran siempre operativos. */
  status: donorStatusEnum('status').notNull().default('active'),
  profileComplete: boolean('profile_complete').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('users_email_key').on(table.email),
])

/** Historial de cambios de estado de donantes (activo / baja). */
export const userStatusEvents = pgTable('user_status_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: donorStatusEnum('status').notNull(),
  /** Admin que aplicó el cambio; nulo en el alta automática. */
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('user_status_events_user_created_idx').on(table.userId, table.createdAt),
])

/** Tokens de un solo uso para restablecer contraseña (generados por un admin). */
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdByUserId: uuid('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('password_reset_tokens_user_idx').on(table.userId),
  uniqueIndex('password_reset_tokens_hash_key').on(table.tokenHash),
])

/** Datos personales y fiscales. Separados de la cuenta para acotar el manejo de PII. */
export const donorProfiles = pgTable('donor_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  phone: varchar('phone', { length: 32 }),
  /** Solo dígitos; sostiene el índice único sin depender del formato capturado. */
  phoneDigits: varchar('phone_digits', { length: 20 }),
  /** Los datos fiscales solo se piden si el donante quiere recibo deducible. */
  wantsReceipt: boolean('wants_receipt').notNull().default(false),
  street: text('street'),
  city: varchar('city', { length: 120 }),
  state: varchar('state', { length: 120 }),
  zip: varchar('zip', { length: 10 }),
  rfc: varchar('rfc', { length: 13 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('donor_profiles_phone_digits_key').on(table.phoneDigits),
])

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 80 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 80 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
}, table => [
  uniqueIndex('campaigns_slug_key').on(table.slug),
])

export const donations = pgTable('donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Nulo si la donación se hizo sin sesión iniciada. */
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  /** Identificador de la iglesia en la API de WordPress; no hay tabla local de iglesias. */
  churchExternalId: varchar('church_external_id', { length: 64 }).notNull(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('MXN'),
  status: donationStatusEnum('status').notNull().default('pending'),
  method: donationMethodEnum('method').notNull().default('spei'),
  /** Proveedor que creó el cobro; spei_manual para transferencia CLABE. */
  provider: paymentProviderEnum('provider'),
  /** Preference id / Order id del proveedor. */
  providerReference: varchar('provider_reference', { length: 128 }),
  /** Payment / capture id definitivo. */
  providerPaymentId: varchar('provider_payment_id', { length: 128 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('donations_user_created_idx').on(table.userId, table.createdAt),
  index('donations_campaign_idx').on(table.campaignId),
  index('donations_provider_ref_idx').on(table.provider, table.providerReference),
])

/**
 * Auditoría idempotente de webhooks de pasarela.
 * No guarda el body completo (PII del pagador).
 */
export const paymentEvents = pgTable('payment_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: paymentProviderEnum('provider').notNull(),
  providerEventId: varchar('provider_event_id', { length: 128 }).notNull(),
  donationId: uuid('donation_id').references(() => donations.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 80 }).notNull(),
  mappedStatus: donationStatusEnum('mapped_status'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('payment_events_provider_event_key').on(table.provider, table.providerEventId),
  index('payment_events_donation_idx').on(table.donationId),
])

/**
 * Preferencias operativas de cobro (sin secretos).
 * Una sola fila (id = 1); el admin la edita en /admin/personalizar/cobros.
 */
export const paymentSettings = pgTable('payment_settings', {
  id: integer('id').primaryKey().default(1),
  /** Proveedor de tarjeta activo (v1: mercadopago). */
  cardProvider: paymentProviderEnum('card_provider').notNull().default('mercadopago'),
  mode: paymentModeEnum('mode').notNull().default('test'),
  cardEnabled: boolean('card_enabled').notNull().default(false),
  paypalEnabled: boolean('paypal_enabled').notNull().default(false),
  speiManualEnabled: boolean('spei_manual_enabled').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Evidencia de consentimiento. La carga de probarlo es del responsable, así que
 * la tabla es append-only: revocar inserta una fila con `granted: false`.
 * Las llaves usan `set null` para que borrar la cuenta no destruya el rastro.
 */
export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  /** Cubre a quien dona sin sesión iniciada. */
  donationId: uuid('donation_id').references(() => donations.id, { onDelete: 'set null' }),
  type: consentTypeEnum('type').notNull(),
  granted: boolean('granted').notNull(),
  /** Versión del aviso vigente al momento de aceptar (LEGAL.noticeVersion). */
  noticeVersion: varchar('notice_version', { length: 32 }).notNull(),
  /** HMAC de la IP, no la IP en claro: la dirección también es dato personal. */
  ipHash: varchar('ip_hash', { length: 64 }),
  userAgent: varchar('user_agent', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('consents_user_created_idx').on(table.userId, table.createdAt),
])

/** Imágenes del carrusel del home. El archivo vive en public/uploads/hero/. */
export const heroSlides = pgTable('hero_slides', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  alt: varchar('alt', { length: 160 }).notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('hero_slides_active_sort_idx').on(table.active, table.sortOrder),
])

/**
 * Contenido editable del pie y SPEI (contacto institucional público).
 * Una sola fila (id = 1); el admin la actualiza desde /admin/personalizar/pie.
 */
export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey().default(1),
  contactPhone: varchar('contact_phone', { length: 40 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  speiBank: varchar('spei_bank', { length: 120 }).notNull(),
  speiBeneficiary: varchar('spei_beneficiary', { length: 200 }).notNull(),
  speiClabe: varchar('spei_clabe', { length: 18 }).notNull(),
  speiConcept: varchar('spei_concept', { length: 80 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
