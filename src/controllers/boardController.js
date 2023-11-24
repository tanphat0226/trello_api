import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log(req.body)
    // console.log(req.query)
    // console.log(req.params)
    // console.log(req.filess)

    // Điều hướng data sang tầng service
    const createdNewBoard = await boardService.createNew(req.body)

    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdNewBoard)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}
