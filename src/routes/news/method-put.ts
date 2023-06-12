import { ResponseError, type ServerRoute } from '../../core/server.js'
import { parseContent } from './parse-content.js'

const route: ServerRoute = async (server, request, response) => {
  const { body } = request

  if (body == null) {
    throw new ResponseError(400, 'Payload required.')
  }

  const { title, thumbnail } = body

  if (!(
    (typeof (title) === 'string') &&
    (typeof (thumbnail) === 'string') &&
    Array.isArray(body.contents)
  )) {
    throw new ResponseError(400, 'Invalid payload.')
  }

  const contents = parseContent(body.contents)

  const { models: { News, NewsContent } } = server

  const news = await News.create({
    createTime: Date.now(),
    updateTime: Date.now(),

    title,
    thumbnail
  })

  for (const content of contents) {
    await NewsContent.create({
      createTime: Date.now(),
      updateTime: Date.now(),
      newsId: news.id,

      ...content
    })
  }

  return server.createResponse(200, { newsId: news.id })
}

export default route
