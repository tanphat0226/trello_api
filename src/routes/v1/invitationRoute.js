import express from 'express'
import { invitationController } from '~/controllers/invitationController'
import { authMiddlewares } from '~/middlewares/authMiddlewares'
import { invitationValidation } from '~/validations/invitationValidation'

const Router = express.Router()

Router.route('/board').post(
  authMiddlewares.isAuthorized,
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation
)

export const invitationRoute = Router
