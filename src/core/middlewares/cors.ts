import { type ServerMiddleware } from '../server.js'

const allowedOrigins: string[] = [
  'http://localhost:8080',
  'https://twice-fan-page.rizzzigit.repl.co'
]

const middleware: ServerMiddleware = async (server, request, response) => {
  const originHeader = request.header('origin')

  if ((originHeader != null) && allowedOrigins.includes(originHeader)) {
    response.setHeader('Access-Control-Allow-Methods', '*')
    response.setHeader('Access-Control-Allow-Headers', '*')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Max-Age', '*')
  }
}

export default middleware
