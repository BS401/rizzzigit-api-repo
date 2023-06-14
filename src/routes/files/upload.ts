import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { method, pathArray } = request

  if (method !== 'POST') {
    throw new ResponseError(400, 'Invalid method.')
  }

  const { models: { UploadToken, File, FileBuffer } } = server

  const tokenId = pathArray[2]
  if (tokenId == null) {
    throw new ResponseError(400, 'token-id required.')
  }

  const token = await UploadToken.findById(tokenId)
  if (
    (token == null) ||
    (token.createTime < (Date.now() - 30000))
  ) {
    throw new ResponseError(404, 'Token does not exist or invalid.')
  }

  await token.deleteOne()

  const file = await File.create({
    createTime: Date.now(),
    updateTime: Date.now(),

    size: 0,
    completed: false
  })

  let size: number = 0
  const bufferSize = 1024 * 1024
  for await (const buffer of request as AsyncIterable<Buffer>) {
    size += buffer.length

    for (let startIndex = 0; startIndex < buffer.length; startIndex += bufferSize) {
      const endIndex = Math.min(buffer.length, startIndex + bufferSize)

      await FileBuffer.create({
        createTime: Date.now(),
        updateTime: Date.now(),

        fileId: file.id,

        blockSize: endIndex - startIndex,
        data: buffer.subarray(startIndex, endIndex)
      })
    }

    file.size = size
    await file.save()
  }

  file.completed = true
  await file.save()

  return server.createResponse(200, { fileId: file.id })
}

export default route
