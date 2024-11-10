import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'

// Docs: https://www.npmjs.com/package/multer

const customFileFilter = (req, file, callback) => {
  // console.log('Multer file filter: ', file)

  // Validate file type with Multer by checking its mimetype.
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null)
  }

  // If valid file type:
  return callback(null, true)
}

// Initialize upload function with multer
const upload = multer({
  limits: {
    fileSize: LIMIT_COMMON_FILE_SIZE
  },
  fileFilter: customFileFilter
})

export const multerUploadMiddlewares = {
  upload
}
