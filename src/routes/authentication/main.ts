import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { method } = request
  const { models: { Account } } = server

  if ((await Account.count()) === 0) {
    switch (method) {
      case 'PUT': return await server.execRoute(request, response, {
        default: (await import('./method-put.js')).default.bind(undefined, {
          noAccounts: true
        })
      })

      default: throw new ResponseError(400, 'Setup required.')
    }
  }

  switch (method) {
    case 'OPTIONS':
    case 'GET': return await server.execRoute(request, response, await import('./method-get.js'))
    case 'POST': return await server.execRoute(request, response, await import('./method-post.js'))
    case 'PUT': return await server.execRoute(request, response, {
      default: ((await import('./method-put.js')).default.bind(undefined, {
        noAccounts: false
      }))
    })

    default: throw new ResponseError(400, 'Invalid method.')
  }
}

export default route
