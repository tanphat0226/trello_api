import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { pickUser } from '~/utils/formatters'
const createNew = async (data) => {
  try {
    // Kiem tra email da ton tai chua
    const existUser = await userModel.findOneByEmail(data.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }
    // Tao data de luu vao DB
    const nameFromEmail = data.email.split('@')[0]
    const newUser = {
      email: data.email,
      password: bcrypt.hashSync(data.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Luu vao DB
    const createdUser = await userModel.createNew(newUser)

    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gui email xac thuc

    // Return data cho controller
    return pickUser(getNewUser)
  } catch (error) {
    throw new Error(error)
  }
}

export const userService = { createNew }
