import { ResponseError, type ServerMiddleware } from '../server.js'

const middleware: ServerMiddleware = async (server, request, response) => {
  request.body = await (async () => {
    if (!(
      (request.method === 'POST') ||
      (request.method === 'PUT')
    )) {
      return
    }

    const buffers: Buffer[] = []

    let contentLength = Number(request.headers['content-length'])
    if (contentLength === 0) {
      return null
    }

    if (Number.isNaN(contentLength)) {
      throw new ResponseError(400, 'Invalid content-length header.')
    }

    const mime = request.header('Content-Type')?.toLowerCase()?.split('/').slice(0, 2) ?? []
    if (contentLength > 1024 * 1024 * 100) {
      throw new ResponseError(400, 'Content-length too large.')
    }
    switch (mime[0]) {
      case 'application': {
        if (mime[1] !== 'json') {
          throw new ResponseError(400, 'Invalid content-type header.')
        }

        for await (const buffer of request) {
          buffers.push(buffer)
          contentLength -= buffer.length

          if (contentLength < 0) {
            break
          }
        }

        if (contentLength !== 0) {
          throw new ResponseError(400, 'Content-length header mismatch.')
        }

        return JSON.parse(Buffer.concat(buffers).toString())
      }
    }
  })()
}

export default middleware
