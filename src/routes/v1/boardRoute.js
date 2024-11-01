import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddlewares } from '~/middlewares/authMiddlewares'

const Router = express.Router()

Router.route('/')
  .get(authMiddlewares.isAuthorized, (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'GET: APIs get list boards.' })
  })
  .post(authMiddlewares.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddlewares.isAuthorized, boardController.getDetails)
  .put(authMiddlewares.isAuthorized, boardValidation.update, boardController.update)

// API hỗ trỡ việc di chuyển card giữa các column khác nhau trong một board
Router.route('/supports/moving_card').put(
  authMiddlewares.isAuthorized,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
)

export const boardRoute = Router
