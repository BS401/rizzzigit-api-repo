import { type ServerMiddleware } from '../server.js'

const middleware: ServerMiddleware = async (server, request, response) => {
  request.pathArray = (() => {
    const pathArray: string[] = []

    for (let pathEntry of request.path.split('/')) {
      pathEntry = pathEntry.trim()

      if (pathEntry.length === 0) {
        continue
      }

      pathArray.push(pathEntry)
    }

    return pathArray
  })()
}

export default middleware
