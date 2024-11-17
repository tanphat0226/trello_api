import { StatusCodes } from 'http-status-codes'
import { invitationService } from '../services/invitationService'

/**
 * Creates a new board invitation.
 *
 * This function processes the creation of a new board invitation by verifying
 * the existence of the inviter, invitee, and board. If any of these entities
 * are not found, it throws an error. It then constructs the invitation data
 * with a default status of pending and saves it to the database. The function
 * returns the created invitation with additional details about the board,
 * inviter, and invitee.
 *
 * @param {Object} req - The express request object.
 * @param {Object} res - The express response object.
 * @param {Function} next - The next middleware function in the stack.
 * @throws {ApiError} If the board, invitee, or inviter is not found.
 * @returns {Object} The created board invitation with additional details.
 */
const createNewBoardInvitation = async (req, res, next) => {
  try {
    const inviterId = req.jwtDecode._id
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)

    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) {
    next(error)
  }
}

export const invitationController = {
  createNewBoardInvitation
}
