import JSDOM from 'jsdom'
import { ResponseError, type ServerRoute } from '../../core/server.js'

const headers: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
}

const baseUrl: string = 'https://twice.jype.com'

interface NoticeEntry {
  _id: string
  title: string
  createTime: number
  updateTime: number
}

const listCache: Record<number, NoticeEntry[]> = {}
const getList = async (page: number): Promise<NoticeEntry[]> => {
  if (page in listCache) {
    return listCache[page]
  }

  const list: NoticeEntry[] = []
  const dom = new JSDOM.JSDOM(await (await fetch(`${baseUrl}/Default/NoticeList?PgIndex=${page}`, {
    headers: { ...headers }
  })).text())

  const { window: { document } } = dom
  const { children } = document.querySelector('div.noticeList>ul') as HTMLUListElement

  for (const child of Array.from(children)) {
    const { children: [element] } = child as unknown as { children: [HTMLAnchorElement] }
    const url = new URL(`${baseUrl}${element.href}`)
    const { searchParams: urlQuery } = url

    const title = element.querySelector('span.tit')?.textContent?.trim() ?? ''
    const createTime = new Date(element.querySelector('span.date')?.textContent?.trim() ?? '').getTime()
    const _id = urlQuery.get('AnSeq') ?? ''

    list.push({ _id, createTime, updateTime: createTime, title })
  }

  return (listCache[page] = list)
}

// interface Notice extends NoticeEntry {
//   thumbnail: string
// }

// const getPicture = async (url: string): Promise<File> {

// }

// const get = async (id: string): Promise<Notice | null> => {
//   const dom = new JSDOM.JSDOM(await (await fetch(`${baseUrl}/Default/NoticeView?AnSeq=${id}`, {
//     headers: { ...headers }
//   })).text())
//   const { window: { document } } = dom

//   const { children: [, titleElement, dateElement] } = document.querySelector('div.boardView_header') as unknown as { children: HTMLParagraphElement[] }
//   const createTime = new Date(`${dateElement.textContent}`).getTime()

//   const contentElement = document.querySelector('div.thumbnail') as unknown as HTMLDivElement

//   for (const entry of Array.from(contentElement.children)) {

//   }

//   return {
//     _id: id,
//     createTime,
//     updateTime: createTime,
//     title: titleElement.textContent?.trim() ?? ''
//   }
// }

const route: ServerRoute = async (server, request, response) => {
  const { method } = request

  switch (method) {
    case 'OPTIONS':
    case 'GET': {
      const { pathArray } = request
      const id = pathArray[1]?.trim().toLowerCase() ?? ''

      if (id === '') {
        const { query: { offset: offsetStr, length: lengthStr } } = request
        const list: NoticeEntry[] = []

        let offset: number = offsetStr != null ? Number(offsetStr) : 0
        const length: number = lengthStr != null ? Number(lengthStr) : 10

        if (
          Number.isNaN(offset) ||
          Number.isNaN(length)
        ) {
          throw new ResponseError(400, 'Invalid query.')
        }

        let page = 1
        while (list.length < length) {
          let received = 0

          while (offset >= 10) {
            offset -= 10
            page++
          }

          for (const entry of await getList(page)) {
            received++
            if (offset > 0) {
              offset--
              continue
            }

            list.push(entry)
          }

          if (received < 10) {
            break
          }

          page++
        }

        return server.createResponse(200, list)
      }

      break
    }
  }

  throw new ResponseError(400, 'Invalid method.')
}

export default route
