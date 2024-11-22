import express from 'express'
import { invitationController } from '~/controllers/invitationController'
import { authMiddlewares } from '~/middlewares/authMiddlewares'
import { invitationValidation } from '~/validations/invitationValidation'

const Router = express.Router()

Router.route('/').get(authMiddlewares.isAuthorized, invitationController.getInvitations)

Router.route('/board').post(
  authMiddlewares.isAuthorized,
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation
)

Router.route('/board/:invitationId').put(
  authMiddlewares.isAuthorized,
  invitationController.updatedBoardInvitation
)

export const invitationRoute = Router
