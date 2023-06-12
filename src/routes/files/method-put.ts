import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  if (request.authentication == null) {
    throw new ResponseError(401, 'Login required.')
  }

  const { models: { UploadToken } } = server

  const uploadToken = await UploadToken.create({
    createTime: Date.now(),
    updateTime: Date.now()
  })

  return server.createResponse(200, { tokenId: uploadToken.id })
}

export default route
