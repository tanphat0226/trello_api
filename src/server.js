/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  // Xử lý CORS
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs v1
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Production Environment (Render.com)
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`3. Production: Back-end Server is running successfully at ${process.env.PORT}`)
    })
  } else {
    // Dev Environment
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local Dev: Hello ${env.AUTHOR}, I am running at  http://${env.LOCAL_DEV_APP_HOST}: ${process.env.PORT}/`)
    })
  }



  // Thực hiện các tác vụ clean up trước khi dừng server
  // https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
  exitHook(() => {
    console.log(' 4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB Cloud Atlas')
  })
}

// Chỉ khi connect tới Database thành công thì mới Start Server Back-end lên
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')

    // Khởi động SERVER
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
})()
//
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlas!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.log(error)
//     process.exit(0)
//   })
