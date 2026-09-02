import 'dotenv/config'

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const isProduction = process.env.NODE_ENV === 'production'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    application_name: 'naradmuni-api',
})

pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error', error)
})

export const db: NodePgDatabase = drizzle(pool, {
    logger: !isProduction,
})

export { pool }
