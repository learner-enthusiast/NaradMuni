import 'dotenv/config'

import dns from 'node:dns'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const isProduction = process.env.NODE_ENV === 'production'

dns.setDefaultResultOrder('ipv6first')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: isProduction
        ? {
              rejectUnauthorized: false,
          }
        : false,

    max: 5,
    min: 0,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    maxLifetimeSeconds: 300,
})

export const db: NodePgDatabase = drizzle(pool, {
    logger: !isProduction,
})
