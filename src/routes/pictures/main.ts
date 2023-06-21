import { ResponseError, type ServerRoute } from '../../core/server.js'

export const route: ServerRoute = async (server, request, response) => {
  const { method, pathArray } = request

  const { models: { File, Picture } } = server
  switch (method) {
    case 'DELETE': {
      const pictureId = pathArray[1]?.trim().toLowerCase() ?? ''
      await Picture.deleteOne({ _id: pictureId })

      return server.createResponse(200)
    }

    case 'GET': {
      const pictureId = pathArray[1]?.trim().toLowerCase() ?? ''
      if (pictureId === '') {
        const { query: { offset: offsetStr, length: lengthStr } } = request

        const offset = Number(offsetStr)
        const length = Number(lengthStr)

        let query = Picture.find({}, {}, {
          sort: {
            createDate: -1,
            _id: -1
          }
        })

        if (!Number.isNaN(offset)) {
          query = query.skip(offset)
        }

        if (!Number.isNaN(length)) {
          query = query.limit(length)
        }

        const result: any[] = []
        for (const entry of await query) {
          result.push(server.leanDocument(entry as any))
        }

        return server.createResponse(200, result)
      } else {
        const picture = await Picture.findById(pictureId)
        if (picture == null) {
          throw new ResponseError(400, 'Picture not found.')
        }

        return server.createResponse(200, server.leanDocument(picture as any))
      }
    }

    case 'PUT': {
      if (request.authentication == null) {
        throw new ResponseError(400, 'Login required.')
      }

      const { body } = request

      if (body == null) {
        throw new ResponseError(400, 'Payload required.')
      }

      const { fileId } = body

      if (!(
        (typeof (fileId) === 'string')
      )) {
        throw new ResponseError(400, 'Invalid payload.')
      }

      const file = await File.findById(fileId)

      if (file == null) {
        throw new ResponseError(404, 'File not found.')
      }

      const picture = await Picture.create({
        createTime: Date.now(),
        updateTime: Date.now(),

        fileId
      })

      return server.createResponse(200, { pictureId: picture.id })
    }

    default: throw new ResponseError(400, 'Invalid method.')
  }
}

export default route
