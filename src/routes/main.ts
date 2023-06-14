import { ResponseError, type ServerRoute } from '../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { pathArray } = request

  switch (pathArray[0]?.toLowerCase()) {
    case 'a':
    case 'auth':
    case 'authentication': return await server.execRoute(request, response, await import('./authentication/main.js'))

    case 'f':
    case 'files': return await server.execRoute(request, response, await import('./files/main.js'))

    case 'n':
    case 'news': return await server.execRoute(request, response, await import('./news/main.js'))

    case 'p':
    case 'pictures': return await server.execRoute(request, response, await import('./pictures/main.js'))

    default: throw new ResponseError(400, 'Invalid path.')
  }
}

export default route
