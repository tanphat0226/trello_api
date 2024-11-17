import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createNewBoardInvitation = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required(),
    inviteeEmail: Joi.string().required().email()
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const invitationValidation = {
  createNewBoardInvitation
}
