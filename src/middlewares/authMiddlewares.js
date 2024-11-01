import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

// Middlewares authorizations accessToken from FE
const isAuthorized = async (req, res, next) => {
  // Get accessToken in request header
  const clientAccessToken = req.cookies?.accessToken
  console.log(clientAccessToken)

  // If clientAccessToken not exist, return error
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, '⛓️‍💥 Unauthorized! (token not found)'))
    return
  }

  try {
    // Step 1: Decode accessToken to see if it is valid.
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    // Step 2: If valid, save decode info to req.jwtDecode for use in the next layer.
    req.jwtDecode = accessTokenDecoded

    // Step 3: Forward the request to the next layer of processing.
    next()
  } catch (error) {
    // console.log('middlewares', error)
    // If the accessToken has expired, return an error (GONE - 410) to the frontend to trigger a refresh.
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, '🔃 Need to refresh token.'))
      return
    }
    // If the accessToken is invalid for any reason, return an error to the frontend to prompt a sign_out.
    next(new ApiError(StatusCodes.UNAUTHORIZED, '⛓️‍💥 Unauthorized!'))
  }
}

export const authMiddlewares = {
  isAuthorized
}
