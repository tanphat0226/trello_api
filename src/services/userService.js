import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { env } from '~/config/environment'
import { userModel } from '~/models/userModel'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNew = async (data) => {
  try {
    // Kiem tra email da ton tai chua
    const existUser = await userModel.findOneByEmail(data.email)
    if (existUser) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')

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

    // Send email verify to user
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello MERN Stack: Please verify your email before using our service!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br/> - PhamTanPhat -</h3>
    `

    // Send email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Return data cho controller
    return pickUser(getNewUser)
  } catch (error) {
    throw new Error(error)
  }
}

const verifyAccount = async (data) => {
  try {
    // Query user from DB
    const existUser = await userModel.findOneByEmail(data.email)

    // Steps to check
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account already verified!')
    if (existUser.verifyToken !== data.token)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid token!')

    // If all step passed, update user info
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    // Update user info in DB
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {
    throw new Error(error)
  }
}

const login = async (data) => {
  try {
    // Query user from DB
    const existUser = await userModel.findOneByEmail(data.email)

    // Steps to check
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcrypt.compareSync(data.password, existUser.password))
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!')

    /**  If all step passed, generate Tokens login for client */
    // Create information to attach to the JWT token including: _id, email of user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    // Generate access token and refresh token to return to client
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5 // 5 seconds
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    // Returns the user data attached to the two generated tokens
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw new Error(error)
  }
}

export const userService = { createNew, verifyAccount, login }
