/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

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
 * @param {Object} reqBody - The request body containing invitee email and board ID.
 * @param {string} inviterId - The ID of the inviter.
 * @throws {ApiError} If the board, invitee, or inviter is not found.
 * @returns {Object} The created board invitation with additional details.
 */
const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Get inviter by id
    const inviter = await userModel.findOneById(inviterId)

    // Get invitee by email
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)

    // Get board by id
    const board = await boardModel.findOneById(reqBody.boardId)

    if (!board || !invitee || !inviter) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board, invitee or inviter not found!')
    }

    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING // Default value is PENDING
      }
    }

    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log('getInvitations: ', getInvitations)

    // Cause invitee, inviter and board are just one element in array, should be convert to json object before return
    const resInvitation = getInvitations.map((invitation) => ({
      ...invitation,
      board: invitation.board[0] || {},
      inviter: invitation.inviter[0] || {},
      invitee: invitation.invitee[0] || {}
    }))

    return resInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = { createNewBoardInvitation, getInvitations }
