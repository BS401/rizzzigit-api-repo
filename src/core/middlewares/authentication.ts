import { type ServerMiddleware } from '../server.js'

const middleware: ServerMiddleware = async (server, request, response) => {
  request.authentication = await (async () => {
    const { models: { Session, Account } } = server

    const sessionId = request.cookies['session-id'] ?? request.query['session-id']
    if (sessionId == null) {
      return null
    }

    const session = await Session.findById(sessionId)
    if ((session == null) || (session.lastActivity < (Date.now() - (1000 * 60 * 60)))) {
      return null
    }

    const account = await Account.findById(session.accountId)
    if (account == null) {
      return null
    }

    session.lastActivity = BigInt(Date.now())
    await session.save()

    return { session, account }
  })() as any
}

export default middleware
