import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  try {
    // console.log(req.body)
    // console.log(req.query)
    // console.log(req.params)
    // console.log(req.filess)

    // Điều hướng data sang tầng service
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'phamphat test message')
    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json({ message: 'POST from Validation: APIs create new boards.' })
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}
