/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic data tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý bản ghi newBoard trong Database
    const createdBoard = await boardModel.createNew(newBoard)

    // console.log(createdBoard)

    // Lấy bản ghi board sau khi gọi (tùy dự án có cần hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log(getNewBoard)

    // Làm thêm các logic khác với các Collection khác tùy đặc thù dự án
    // Bắn email, notification về cho admin khi có 1 board mới được tạo,...vv

    // Trả kết quả về, trong service luôn phải có return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Deep clone board tạo ra cái mới để xử lý, không bị ảnh hưởng tới board ban đầu
    const resBoard = cloneDeep(board)
    // Đưa card vào trong column cảu nó
    resBoard.columns.forEach(column => {
      // MongoDB hỗ trợ so sanh 2 ObjectId với nhau bắng ObjectId.Equals Method
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // Convert 2 ObjectId về string để so sánh
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // Xóa card khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}


export const boardService = {
  createNew,
  getDetails
}