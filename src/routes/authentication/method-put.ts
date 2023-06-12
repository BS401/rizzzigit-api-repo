import type Express from 'express'
import Bcrypt from 'bcrypt'

import { type ServerResponse, type Server, ResponseError } from '../../core/server.js'

export default async ({
  noAccounts
}: {
  noAccounts: boolean
}, server: Server, request: Express.Request, response: Express.Response): Promise<ServerResponse | null> => {
  if (!noAccounts) {
    throw new ResponseError(403, 'Account already set up.')
  }

  const { models: { Account } } = server
  const { body } = request

  if (body == null) {
    throw new ResponseError(400, 'Payload required.')
  }

  const { username, password } = body

  if (!(
    (typeof (username) === 'string') &&
    (typeof (password) === 'string')
  )) {
    throw new ResponseError(400, 'Invalid payload.')
  }

  if (await Account.exists({ username: username.toLowerCase() }) != null) {
    throw new ResponseError(400, 'Username already taken.')
  }

  await Account.create({
    createTime: Date.now(),
    updateTime: Date.now(),

    username: username.toLowerCase(),
    password: await Bcrypt.hash(password, 10)
  })

  return server.createResponse(200)
}
