import express from 'express'
import { columnController } from '~/controllers/columnController'
import { authMiddlewares } from '~/middlewares/authMiddlewares'
import { columnValidation } from '~/validations/columnValidation'

const Router = express.Router()

Router.route('/').post(
  authMiddlewares.isAuthorized,
  columnValidation.createNew,
  columnController.createNew
)

Router.route('/:id')
  .put(authMiddlewares.isAuthorized, columnValidation.update, columnController.update)
  .delete(authMiddlewares.isAuthorized, columnValidation.deleteItem, columnController.deleteItem)

export const columnRoute = Router
