import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { clerkMiddleware } from '@clerk/express'
import { userRouter } from './modules/user/user.routes.js'
import { pollRouter } from './modules/poll/poll.routes.js'
import { adminRouter } from './modules/admin/admin.routes.js'
import { registerSocketHandlers } from './socket/index.js'
import { env } from './env.js'
import { initIO } from './lib/socket.js'
import { errorHandler } from './lib/http.js'
import { startPollExpiryJob } from './jobs/expire-polls.js'
import morganMiddleware from './logger/morgan.logger.js'

const app = express()
const server = createServer(app)

const clientOrigins = env.CLIENT.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

// ── Export io so controllers can use getIO() ──────────────
const io = new Server(server, {
    cors: { origin: clientOrigins },
})

initIO(io)

async function main() {
    const port = Number(env.PORT || 3000)
    registerSocketHandlers(io)

    app.use(
        cors({
            origin: clientOrigins,
            credentials: true,
        })
    )

    app.use(clerkMiddleware())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(morganMiddleware)

    app.get('/health', (req, res) => {
        return res.send("I'm up and running")
    })
    app.get('/', (req, res) => {
        return res.send('NARADMUNI-APP')
    })

    app.use('/api/user', userRouter)
    app.use('/api/poll', pollRouter)
    app.use('/api/admin', adminRouter)
    app.use(errorHandler)
    const stopPollExpiryJob = startPollExpiryJob()

    server.listen(port, () => {
        console.log(`server is listening on http://localhost:${port}`)
    })

    const shutdown = () => {
        stopPollExpiryJob()
        server.close(() => process.exit(0))
    }

    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
}

main()
