import multer, { StorageEngine } from 'multer'
import { Request } from 'express'

const storage: StorageEngine = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb): void => {
        // Ensure public/images exists
        cb(null, './public/images')
    },

    filename: (_req: Request, file: Express.Multer.File, cb): void => {
        let fileExtension = ''

        if (file.originalname.split('.').length > 1) {
            fileExtension = file.originalname.substring(
                file.originalname.lastIndexOf('.')
            )
        }

        const filenameWithoutExtension = file.originalname
            .toLowerCase()
            .split(' ')
            .join('-')
            .split('.')[0]

        const uniqueSuffix = Date.now() + Math.ceil(Math.random() * 1e5)

        cb(null, `${filenameWithoutExtension}${uniqueSuffix}${fileExtension}`)
    },
})

// Multer upload middleware
export const upload = multer({
    storage,

    limits: {
        fileSize: 1 * 1000 * 1000, // 1MB
    },
})
