import { Router } from 'express'
import { asyncHandler } from '../../lib/http.js'
import { closePollAsAdmin, getAdminOverview } from './admin.controller.js'

export const adminRouter = Router()

adminRouter.get('/overview', asyncHandler(getAdminOverview))
adminRouter.post('/polls/:id/close', asyncHandler(closePollAsAdmin))
