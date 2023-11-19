import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

// Khởi tạo object trelloDatabaseInstance ban đầu là null (vì chưa connect)
let trelloDatabaseInstance = null

const mongodbClientInstance = new MongoClient(env.MONGODB_URI, {
  // Set stable API https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới Database
export const CONNECT_DB = async () => {
  // Gọi connect tới MongoDB Atlas với URI đã khai báo trong mongodbClientInstance
  await mongodbClientInstance.connect()

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance
  trelloDatabaseInstance = mongodbClientInstance.db(env.DATABASE_NAME)
}

// Đóng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
  await mongodbClientInstance.close()
}

// GET_DB (no async) có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB Atlas để dùng nhiều nơi khác
// Chỉ gọi GET_DB sau khi đã connect thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database first!')
  return trelloDatabaseInstance
}