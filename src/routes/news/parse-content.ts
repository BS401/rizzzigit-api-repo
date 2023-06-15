import { NewsContentType, type NewsImageContent, type NewsTextContent, type NewsLinkContent } from '../../core/models.js'
import { ResponseError } from '../../core/server.js'

type _ParsedNewsContent<T> = Omit<T, 'createTime' | 'updateTime' | 'newsId' >
export type ParsedNewsImageContent = _ParsedNewsContent<NewsImageContent>
export type ParsedNewsTextContent = _ParsedNewsContent<NewsTextContent>
export type ParsedNewsLinkContent = _ParsedNewsContent<NewsLinkContent>
export type ParsedNewsContent = ParsedNewsImageContent | ParsedNewsTextContent | ParsedNewsLinkContent

export const parseContent = (contents: any): ParsedNewsContent[] => {
  const parsedContents: ParsedNewsContent[] = []

  for (const rawContent of contents) {
    switch (rawContent.contentType) {
      case NewsContentType.Image:
        if (!(
          (typeof (rawContent.pictureId) === 'string')
        )) {
          throw new ResponseError(400, 'Invalid payload.')
        }

        parsedContents.push({
          contentType: NewsContentType.Image,

          pictureId: rawContent.pictureId
        })
        break

      case NewsContentType.Link:
        if (!(
          (typeof (rawContent.name) === 'string') &&
          (typeof (rawContent.link) === 'string')
        )) {
          throw new ResponseError(400, 'Invalid payload.')
        }

        parsedContents.push({
          contentType: NewsContentType.Link,

          name: rawContent.name,
          link: rawContent.link
        })
        break

      case NewsContentType.Text:
        if (!(
          typeof (rawContent.content) === 'string'
        )) {
          throw new ResponseError(400, 'Invalid payload.')
        }

        parsedContents.push({
          contentType: NewsContentType.Text,

          content: rawContent.content
        })
        break

      default: throw new ResponseError(400, 'Invalid payload.')
    }
  }

  return parsedContents
}
