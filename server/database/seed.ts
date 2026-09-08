import { readFile } from 'node:fs/promises'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { campaigns, paymentSettings, siteSettings } from './schema.ts'
import { DEFAULT_SITE_SETTINGS } from '../../utils/siteSettingsDefaults.ts'

interface SeedCampaign {
  name: string
  slug: string
  description: string
  type: string
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Copie .env.example a .env y complete la cadena de conexión.')
  process.exit(1)
}

const raw = await readFile('./server/data/campaigns.json', 'utf8')
const source = JSON.parse(raw) as SeedCampaign[]

const client = postgres(url, { max: 1 })
const db = drizzle(client)

try {
  for (const [index, item] of source.entries()) {
    await db
      .insert(campaigns)
      .values({
        slug: item.slug,
        name: item.name,
        description: item.description,
        type: item.type,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: campaigns.slug,
        set: {
          name: item.name,
          description: item.description,
          type: item.type,
          sortOrder: index,
        },
      })
  }
  console.log(`Campañas sincronizadas: ${source.length}.`)

  await db
    .insert(siteSettings)
    .values({ id: 1, ...DEFAULT_SITE_SETTINGS })
    .onConflictDoNothing()
  console.log('site_settings: fila por defecto asegurada.')

  await db
    .insert(paymentSettings)
    .values({
      id: 1,
      cardProvider: 'mercadopago',
      mode: 'test',
      cardEnabled: false,
      paypalEnabled: false,
      speiManualEnabled: true,
    })
    .onConflictDoNothing()
  console.log('payment_settings: fila por defecto asegurada.')
}
finally {
  await client.end()
}
