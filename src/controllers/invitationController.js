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

/**
 * Gets all invitations of a user.
 *
 * This function takes the user ID from the request and queries the
 * invitations database to find all invitations associated with the user.
 * It returns the invitations as an array of objects in the response.
 *
 * @param {Object} req - The express request object.
 * @param {Object} res - The express response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Object[]} The array of invitations associated with the user.
 */
const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecode._id
    const invitations = await invitationService.getInvitations(userId)
    res.status(StatusCodes.OK).json(invitations)
  } catch (error) {
    next(error)
  }
}

const updatedBoardInvitation = async (req, res, next) => {
  try {
    const userId = req.jwtDecode._id
    const { invitationId } = req.params
    const { status } = req.body

    const updatedInvitation = await invitationService.updatedBoardInvitation(
      userId,
      invitationId,
      status
    )

    res.status(StatusCodes.OK).json(updatedInvitation)
  } catch (error) {
    next(error)
  }
}

export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updatedBoardInvitation
}
