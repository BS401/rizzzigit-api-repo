import { type Document, type File } from '../../core/models.js'
import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { pathArray } = request

  const fileId = pathArray[1]?.trim()?.toLowerCase() ?? ''
  if (fileId === '') {
    throw new ResponseError(400, 'Invalid file id.')
  }

  const { models: { File, FileBuffer } } = server

  const file = await File.findById(fileId)
  if (file == null) {
    throw new ResponseError(404, 'File not found.')
  }

  if (pathArray[2] === 'raw') {
    response.setHeader('Content-Length', file.size)
    for (const fileBufferMetadata of await FileBuffer.find({ fileId: file.id }, { blockSize: 1, _id: 1 })) {
      response.write((await FileBuffer.findById(fileBufferMetadata._id))?.data)
    }

    return null
  }

  return server.createResponse(200, server.leanDocument(file as unknown as Document<File>))
}

export default route
