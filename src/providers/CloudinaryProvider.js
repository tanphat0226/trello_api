import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '../config/environment'

/**
 * Doc: https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud
 */

// Config cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// Initialize function to upload file to cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    // Create stream upload to cloudinary
    const stream = cloudinary.uploader.upload_stream({ folder: folderName }, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })

    // Thực hiện upload cái luồng trên bằng lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = {
  streamUpload
}
