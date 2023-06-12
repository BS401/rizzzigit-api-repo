import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { authentication } = request
  if (authentication == null) {
    throw new ResponseError(401, 'Login required.')
  }

  const { session } = authentication

  return server.createResponse(200, server.leanDocument(session))
}

export default route
