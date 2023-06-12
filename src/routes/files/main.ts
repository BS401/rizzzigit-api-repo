import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { method } = request

  const fileId = request.pathArray[1]?.toLowerCase() ?? ''
  switch (fileId) {
    case 'u':
    case 'upload': return await server.execRoute(request, response, await import('./upload.js'))

    case '': {
      switch (method) {
        case 'PUT': return await server.execRoute(request, response, await import('./method-put.js'))

        default: throw new ResponseError(400, 'Invalid method.')
      }
    }

    default: {
      switch (method) {
        case 'OPTIONS':
        case 'GET': return await server.execRoute(request, response, await import('./method-get.js'))

        default: throw new ResponseError(400, 'Invalid method.')
      }
    }
  }
}

export default route
