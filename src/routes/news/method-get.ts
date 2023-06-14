import { type NewsContent, type Document, type News } from '../../core/models.js'
import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { models: { News, NewsContent } } = server

  const { pathArray } = request
  const newsId = pathArray[1]?.trim()?.toLowerCase() ?? ''

  if (newsId === '') {
    const { query: { offset: offsetStr, length: lengthStr } } = request
    const offset = Number(offsetStr)
    const length = Number(lengthStr)

    let query = News.find({}, undefined, {
      sort: {
        createTime: -1
      }
    })

    if (!Number.isNaN(offset)) {
      query = query.skip(offset)
    }

    if (!Number.isNaN(length)) {
      query = query.limit(length)
    }

    const news = await Promise.all((await query).map(async (news) => {
      const contents = (await NewsContent.find({ newsId: news.id })).map((entry) => server.leanDocument(entry as unknown as Document<NewsContent>))

      return Object.assign(server.leanDocument(news as unknown as Document<NewsContent>), { contents })
    }))

    return server.createResponse(200, news)
  }

  const news = await News.findById(newsId)
  if (news == null) {
    throw new ResponseError(404, 'News not found.')
  }

  const contents = (await NewsContent.find({ newsId: news.id })).map((entry) => server.leanDocument(entry as unknown as Document<NewsContent>))
  return server.createResponse(200, Object.assign(server.leanDocument(news as unknown as Document<News>), { contents }))
}

export default route
