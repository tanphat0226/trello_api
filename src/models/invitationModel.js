import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

const INVITATIONS_COLLECTION_NAME = 'invitations'
const INVITATIONS_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string()
    .required()
    .valid(...Object.values(INVITATION_TYPES)),

  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string()
      .required()
      .valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'inviterId', 'inviteeId', 'type']

/**
 * Validates the invitation data before creating a new invitation.
 *
 * This function uses the INVITATIONS_COLLECTION_SCHEMA to validate the provided
 * invitation data. It ensures that the data conforms to the expected schema
 * and rules, aborting early if any validation errors are encountered.
 *
 * @param {Object} data - The invitation data to validate.
 * @returns {Promise<Object>} The validated data if successful, or throws an error if validation fails.
 * @throws {Error} If the validation fails.
 */
const validateBeforeCreate = async (data) => {
  return await INVITATIONS_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

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
 * @param {Object} data - The request body containing invitee email and board ID.
 * @throws {ApiError} If the board, invitee, or inviter is not found.
 * @returns {Object} The created board invitation with additional details.
 */
const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    if (newInvitationToAdd.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const createdInvitation = await GET_DB()
      .collection(INVITATIONS_COLLECTION_NAME)
      .insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Finds an invitation by its ID.
 *
 * This function retrieves a single invitation document from the database
 * using the provided invitation ID. It queries the invitations collection
 * to find a document with a matching ObjectId.
 *
 * @param {string} invitationId - The ID of the invitation to find.
 * @returns {Promise<Object>} The invitation document if found, or null if not found.
 * @throws {Error} If an error occurs during the database query.
 */
const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB()
      .collection(INVITATIONS_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(invitationId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Updates an existing invitation.
 *
 * This function takes an invitation ID and an object of updated fields and
 * updates the corresponding invitation document in the database. It filters
 * out any fields that are not allowed to be updated and converts board ID
 * fields to ObjectId instances before performing the update.
 *
 * @param {string} invitationId - The ID of the invitation to update.
 * @param {Object} updatedData - The object containing the updated fields.
 * @returns {Promise<Object>} The updated invitation document if found, or null
 *     if not found.
 * @throws {Error} If an error occurs during the database query.
 */
const update = async (invitationId, updatedData) => {
  try {
    // Lọc những field mà không cho phép cập nhật
    Object.keys(updatedData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updatedData[fieldName]
      }
    })

    if (updatedData.boardInvitation) {
      updatedData.boardInvitation = {
        ...updatedData.boardInvitation,
        boardId: new ObjectId(updatedData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB()
      .collection(INVITATIONS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(invitationId) },
        { $set: updatedData },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findByUser = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(userId) }, // Find by invitee ID
      { _destroy: false }
    ]

    const results = await GET_DB()
      .collection(INVITATIONS_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'board'
          }
        }
      ])
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATIONS_COLLECTION_NAME,
  INVITATIONS_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}
