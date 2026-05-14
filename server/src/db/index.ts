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
})

export const db: NodePgDatabase = drizzle(pool, {
    logger: true,
})

// vmMF7wOH1ALi8FUd
// learner-enthusiast's Project
