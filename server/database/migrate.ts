import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Copie .env.example a .env y complete la cadena de conexión.')
  process.exit(1)
}

const client = postgres(url, { max: 1 })

try {
  await migrate(drizzle(client), { migrationsFolder: './server/database/migrations' })
  console.log('Migraciones aplicadas.')
}
finally {
  await client.end()
}
