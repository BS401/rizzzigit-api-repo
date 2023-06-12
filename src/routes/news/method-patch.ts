import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  // const { models: { News } } = server

  // const { pathArray } = request
  // const newsId = pathArray[1]?.trim()?.toLowerCase() ?? ''

  // if (newsId === '') {
  //   throw new ResponseError(400, 'Invalid news id.')
  // }

  // const news = await News.findById(newsId)
  // if (news == null) {
  //   throw new ResponseError(404, 'News not found.')
  // }

  throw new ResponseError(501, 'Method not implemented.')
}

export default route
