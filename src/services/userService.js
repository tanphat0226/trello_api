/* eslint-disable no-useless-catch */
import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { env } from '~/config/environment'
import { userModel } from '~/models/userModel'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
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
      // 30 // 15 seconds
    )

    // Returns the user data attached to the two generated tokens
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (data) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      data,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // Khởi tạo kết quả updated User ban đầu là empty
    let updatedUser = {}

    // Case 1: Update password
    if (reqBody.current_password && reqBody.new_password) {
      // Check current password is correct or not
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current password is incorrect!')
      }
      //  If current password is correct, update new password in DB
      updatedUser = await userModel.update(existUser._id, {
        password: bcrypt.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      // Case 2: Update file to Cloud Storage (Cloudinary)
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')

      // Save url of image file to DB
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
      // console.log(updatedUser)
    } else {
      // Case 3: Update other fields
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = { createNew, verifyAccount, login, refreshToken, update }
