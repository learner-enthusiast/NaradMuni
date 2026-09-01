import { and, asc, eq, gt, isNotNull, lte } from 'drizzle-orm'
import { db } from '../db/index.js'
import { pollsTable } from '../db/schema.js'
import { getIO } from '../lib/socket.js'

let expiryTimer: ReturnType<typeof setTimeout> | null = null

export async function expireDuePolls() {
    const expiredAt = new Date()
    const expiredPolls = await db
        .update(pollsTable)
        .set({
            status: 'expired',
            updatedAt: expiredAt,
        })
        .where(
            and(
                eq(pollsTable.status, 'active'),
                lte(pollsTable.expiresAt, expiredAt)
            )
        )
        .returning({
            id: pollsTable.id,
            slug: pollsTable.slug,
            title: pollsTable.title,
        })

    if (expiredPolls.length > 0) {
        const io = getIO()
        for (const poll of expiredPolls) {
            io.to(`poll:${poll.id}`).emit('poll:expired', {
                pollId: poll.id,
                slug: poll.slug,
                title: poll.title,
                expiredAt,
            })
        }
        console.log(`expired ${expiredPolls.length} poll(s)`)
    }

    return expiredPolls
}

async function getNextExpiryAt() {
    const [nextPoll] = await db
        .select({ expiresAt: pollsTable.expiresAt })
        .from(pollsTable)
        .where(
            and(
                eq(pollsTable.status, 'active'),
                isNotNull(pollsTable.expiresAt),
                gt(pollsTable.expiresAt, new Date())
            )
        )
        .orderBy(asc(pollsTable.expiresAt))
        .limit(1)

    return nextPoll?.expiresAt ?? null
}

async function runExpiryCycle() {
    await expireDuePolls()
    await schedulePollExpiry()
}

export async function schedulePollExpiry() {
    if (expiryTimer) {
        clearTimeout(expiryTimer)
        expiryTimer = null
    }

    const nextExpiryAt = await getNextExpiryAt()
    if (!nextExpiryAt) return

    const delay = Math.max(nextExpiryAt.getTime() - Date.now(), 0)

    expiryTimer = setTimeout(() => {
        runExpiryCycle().catch((error) => {
            console.error('poll expiry job failed', error)
            schedulePollExpiry().catch((retryError) => {
                console.error('poll expiry reschedule failed', retryError)
            })
        })
    }, delay)
}

export function startPollExpiryJob() {
    runExpiryCycle().catch((error) => {
        console.error('poll expiry job failed on startup', error)
        schedulePollExpiry().catch((retryError) => {
            console.error('poll expiry reschedule failed', retryError)
        })
    })

    return () => {
        if (expiryTimer) clearTimeout(expiryTimer)
    }
}
