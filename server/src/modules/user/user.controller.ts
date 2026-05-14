import type { Request, Response } from 'express'
import { currentUser } from '../poll/poll.controller.js'

export async function me(req: Request, res: Response) {
    return currentUser(req, res)
}
