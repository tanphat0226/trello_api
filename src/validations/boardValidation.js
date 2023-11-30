import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'

const createNew = async (req, res, next) => {
  // Luôn luôn validation data
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    // set abortEarly: false để trường hợp có nhiều lỗi validaation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })

    // Validate data hợp lệ thì cho request đi tiếp sang Controller (middleware)
    next()
  } catch (error) {
    // const errorMessage = new Error(error).message
    // const customMessage = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew
}
