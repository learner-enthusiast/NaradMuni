import { Router } from 'express'
import { asyncHandler } from '../../lib/http.js'
import {
    createPoll,
    getAnalytics,
    closePoll,
    duplicatePoll,
    exportResponses,
    listResponses,
    getOwnedPoll,
    getPublicPoll,
    listPolls,
    publishPoll,
    reopenPoll,
    submitPoll,
    uploadCoverPhoto,
    deleteCoverPhoto,
} from './poll.controller.js'
import { upload } from '../../middlewares/multer.middleware.js'

export const pollRouter = Router()

pollRouter.get('/', asyncHandler(listPolls))
pollRouter.post('/', asyncHandler(createPoll))
pollRouter.get('/public/:slug', asyncHandler(getPublicPoll))
pollRouter.post('/public/:slug/submit', asyncHandler(submitPoll))
pollRouter.get('/:id/export.csv', asyncHandler(exportResponses))
pollRouter.get('/:id/responses', asyncHandler(listResponses))
pollRouter.post('/:id/close', asyncHandler(closePoll))
pollRouter.post('/:id/reopen', asyncHandler(reopenPoll))
pollRouter.post('/:id/duplicate', asyncHandler(duplicatePoll))
pollRouter.get('/:id', asyncHandler(getOwnedPoll))
pollRouter.get('/:id/analytics', asyncHandler(getAnalytics))
pollRouter.post('/:id/publish', asyncHandler(publishPoll))
pollRouter.post(
    '/cover-photo',
    upload.single('coverPhoto'),
    asyncHandler(uploadCoverPhoto)
)
pollRouter.post('/cover-photo/delete', asyncHandler(deleteCoverPhoto))
