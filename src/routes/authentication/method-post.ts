import Bcrypt from 'bcrypt'

import { ResponseError, type ServerRoute } from '../../core/server.js'

const route: ServerRoute = async (server, request, response) => {
  const { body: post } = request

  if (request.pathArray[1]?.toLowerCase() === 'logout') {
    const { authentication } = request

    if (authentication != null) {
      await authentication.session.deleteOne()

      return server.createResponse(200)
    }

    throw new ResponseError(400, 'Not logged in.')
  }
  if (post == null) {
    throw new ResponseError(400, 'Payload required.')
  }

  const { username, password } = post
  if (!(
    (typeof (username) === 'string') &&
    (typeof (password) === 'string')
  )) {
    throw new ResponseError(400, 'Invalid payload.')
  }

  const { models: { Account, Session } } = server

  const account = await Account.findOne({ username: username.toLowerCase() })
  if ((account == null) || !(await Bcrypt.compare(password, account.password))) {
    throw new ResponseError(400, 'Username or password invalid.')
  }

  const session = await Session.create({
    createTime: Date.now(),
    updateTime: Date.now(),

    accountId: account.id,
    lastActivity: Date.now()
  })

  return server.createResponse(200, { sessionId: session._id })
}

export default route
