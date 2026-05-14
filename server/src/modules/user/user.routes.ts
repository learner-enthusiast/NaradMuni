import { Router } from 'express'
import { asyncHandler } from '../../lib/http.js'
import { me } from './user.controller.js'

export const userRouter = Router()

userRouter.get('/me', asyncHandler(me))
