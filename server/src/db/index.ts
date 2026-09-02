import 'dotenv/config'

import dns from 'node:dns'
import { resolve4 } from 'node:dns/promises'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool, type PoolConfig } from 'pg'

const isProduction = process.env.NODE_ENV === 'production'

dns.setDefaultResultOrder('ipv4first')

async function buildPoolConfig(): Promise<PoolConfig> {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('DATABASE_URL is required')
    }

    const url = new URL(connectionString)
    const hostname = url.hostname

    const config: PoolConfig = {
        max: 3,
        min: 0,
        connectionTimeoutMillis: 20_000,
        idleTimeoutMillis: 60_000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10_000,
        application_name: 'naradmuni-api',
        ssl: isProduction
            ? {
                  rejectUnauthorized: false,
                  servername: hostname,
              }
            : false,
    }

    if (isProduction) {
        try {
            const [ipv4] = await resolve4(hostname)
            url.hostname = ipv4
            config.host = ipv4
            config.port = Number(url.port) || 5432
            config.user = decodeURIComponent(url.username)
            config.password = decodeURIComponent(url.password)
            config.database = url.pathname.replace(/^\//, '') || undefined

            const sslmode = url.searchParams.get('sslmode')
            if (sslmode) {
                config.options = `-c sslmode=${sslmode}`
            }
        } catch (error) {
            console.warn(
                'Could not resolve database host to IPv4; falling back to hostname',
                error
            )
            config.connectionString = connectionString
        }
    } else {
        config.connectionString = connectionString
    }

    return config
}

const pool = new Pool(await buildPoolConfig())

pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error', error)
})

export const db: NodePgDatabase = drizzle(pool, {
    logger: !isProduction,
})

export { pool }
