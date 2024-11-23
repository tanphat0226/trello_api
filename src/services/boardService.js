/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { slugify } from '~/utils/formatters'

const createNew = async (userId, reqBody) => {
  try {
    // Xử lý logic data tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý bản ghi newBoard trong Database
    const createdBoard = await boardModel.createNew(userId, newBoard)

    // console.log(createdBoard)

    // Lấy bản ghi board sau khi gọi (tùy dự án có cần hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log(getNewBoard)

    // Làm thêm các logic khác với các Collection khác tùy đặc thù dự án
    // Bắn email, notification về cho admin khi có 1 board mới được tạo,...vv

    // Trả kết quả về, trong service luôn phải có return
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Deep clone board tạo ra cái mới để xử lý, không bị ảnh hưởng tới board ban đầu
    const resBoard = cloneDeep(board)
    // Đưa card vào trong column cảu nó
    resBoard.columns.forEach((column) => {
      // MongoDB hỗ trợ so sanh 2 ObjectId với nhau bắng ObjectId.Equals Method
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id))

      // Convert 2 ObjectId về string để so sánh
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // Xóa card khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // Step 1: Update cardOrderIds of the original column (remove the card _id from the array)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // Step 2: Update cardOrderIds of the next column (add the card _id from the array)
    await columnModel.update(reqBody.nextColoumId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // Step 3: Update the new columnId of the dragged card
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColoumId,
      updatedAt: Date.now()
    })

    return { updateResult: 'Successfully!' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, quayFilters) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const result = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      quayFilters
    )

    return result
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
