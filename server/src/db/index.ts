import 'dotenv/config'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const isProduction = process.env.NODE_ENV === 'production'

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

// vmMF7wOH1ALi8FUd
// learner-enthusiast's Project
