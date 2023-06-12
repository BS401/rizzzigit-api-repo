import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { method, authentication } = request

  switch (method) {
    case 'OPTIONS':
    case 'GET': return await server.execRoute(request, response, await import('./method-get.js'))
  }

  if (authentication == null) {
    throw new ResponseError(401, 'Login required.')
  }

  switch (method) {
    case 'PUT': return await server.execRoute(request, response, await import('./method-put.js'))
    case 'PATCH': return await server.execRoute(request, response, await import('./method-patch.js'))
    case 'DELETE': return await server.execRoute(request, response, await import('./method-delete.js'))

    default: throw new ResponseError(400, 'Invalid method.')
  }
}

export default route
