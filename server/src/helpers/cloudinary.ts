import { v2 as cloudinary } from 'cloudinary'
import 'dotenv/config'
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(filePath: string): Promise<string> {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    const result = await cloudinary.uploader.upload(filePath, {
        folder: 'polls/covers',
        upload_preset:
            process.env.CLOUDINARY_UPLOAD_PRESET ?? 'poll_cover_unsigned',
    })
    return result.secure_url
}

export async function deleteFromCloudinary(url: string): Promise<void> {
    // Extract public_id from the URL
    // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/polls/covers/abc.jpg
    //      → polls/covers/abc
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i)
    if (!matches?.[1])
        throw new Error(`Could not parse public_id from URL: ${url}`)
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    await cloudinary.uploader.destroy(matches[1])
}
