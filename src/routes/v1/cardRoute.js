import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddlewares } from '~/middlewares/authMiddlewares'

const Router = express.Router()

Router.route('/').post(
  authMiddlewares.isAuthorized,
  cardValidation.createNew,
  cardController.createNew
)

Router.route('/:id').put(authMiddlewares.isAuthorized, cardValidation.update, cardController.update)

export const cardRoute = Router
