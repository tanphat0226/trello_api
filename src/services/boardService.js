/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic data tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý bản ghi newBoard trong Database
    // ...

    // Làm thêm các logic khác với các Collection khác tùy đặc thù dự án
    // Bắn email, notification về cho admin khi có 1 board mới được tạo,...vv

    // Trả kết quả về, trong service luôn phải có return
    return newBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew
}