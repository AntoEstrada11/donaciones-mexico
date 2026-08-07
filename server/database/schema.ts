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

export const donationStatusEnum = pgEnum('donation_status', ['paid', 'pending', 'failed', 'cancelled'])
export const donationMethodEnum = pgEnum('donation_method', ['spei', 'card'])

/** Cuenta de acceso del donante. El correo es único pero puede cambiar, por eso la PK es sintética. */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  profileComplete: boolean('profile_complete').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('users_email_key').on(table.email),
])

/** Datos personales y fiscales. Separados de la cuenta para acotar el manejo de PII. */
export const donorProfiles = pgTable('donor_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  phone: varchar('phone', { length: 32 }),
  /** Solo dígitos; sostiene el índice único sin depender del formato capturado. */
  phoneDigits: varchar('phone_digits', { length: 20 }),
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
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index('donations_user_created_idx').on(table.userId, table.createdAt),
  index('donations_campaign_idx').on(table.campaignId),
])
