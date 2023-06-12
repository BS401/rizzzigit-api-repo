#!/bin/env node
import DotEnv from 'dotenv'
import HTTP from 'http'

import { Server } from './core/server.js'

DotEnv.config()

const run = async (): Promise<void> => {
  const http = HTTP.createServer()
  const server = new Server({
    http,

    mongoose: {
      url: new URL('mongodb+srv://cluster0.zno7yj8.mongodb.net/?retryWrites=true&w=majority'),
      connectOptions: {
        user: process.env.DB_USERNAME as string,
        pass: process.env.DB_PASSWORD as string,
        dbName: 'TWICEFanPage'
      }
    }
  })

  http.listen(8081)
  await server.init()
}

void run()
