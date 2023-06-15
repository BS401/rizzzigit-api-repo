import Express from 'express'
import Mongoose from 'mongoose'

import type HTTP from 'http'
import type HTTPS from 'https'

import { type Document, Models } from './models.js'

export interface ServerOptions {
  http?: HTTP.Server
  https?: HTTPS.Server

  mongoose: {
    url: URL
    options?: Mongoose.MongooseOptions
    connectOptions?: Mongoose.ConnectOptions
  }
}

export type ServerRoute = (server: Server, request: Express.Request, response: Express.Response) => Promise<ServerResponse | null>
export type ServerMiddleware = (server: Server, request: Express.Request, response: Express.Response) => Promise<void>

export interface ServerError {
  name: string
  message: string
  stack?: string
  cause?: ServerError
}

export type ServerResponse = {
  status: number
} & (
  {
    status: number
  } | {
    error: ServerError
  } | {
    data: Record<string, any>
  }
)

export class Server {
  public constructor (options: ServerOptions) {
    this.#express = Express()
    this.#options = { ...options }
    this.#mongoose = new Mongoose.Mongoose(this.#options.mongoose.options)
    this.models = new Models(this, this.#mongoose)
  }

  #express: Express.Application
  #options: ServerOptions
  public async init (): Promise<void> {
    const { http, https } = this.#options
    const express = this.#express

    if (http != null) {
      http.on('request', express)
    }

    if (https != null) {
      https.on('request', express)
    }

    express.use((await import('cookie-parser')).default())
    express.use((request, response) => { void this.#onRequest(request, response) })
    await this.models.init(this.#options.mongoose.url, this.#options.mongoose.connectOptions)
  }

  public readonly models: Models
  #mongoose: Mongoose.Mongoose

  async #onRequest (request: Express.Request, response: Express.Response): Promise<void> {
    const result = await this.#runRequest(request, response)

    if (result != null) {
      response.statusCode = result.status

      const toSend = (() => {
        response.setHeader('Content-Type', 'application/json')
        const data = Buffer.from(JSON.stringify(result, (key, value) => {
          if (typeof (value) === 'bigint') {
            return value.toString()
          }

          return value
        }), 'utf-8')
        response.setHeader('Content-Length', data.length)
        return data
      })()

      if (request.method !== 'OPTIONS') {
        response.write(toSend)
      }
    }

    response.end()
  }

  async #runRequest (request: Express.Request, response: Express.Response): Promise<ServerResponse | null> {
    try {
      for (const { default: middleware } of [
        await import('./middlewares/cors.js'),
        await import('./middlewares/path-array.js'),
        await import('./middlewares/body.js'),
        await import('./middlewares/authentication.js')
      ]) {
        await middleware(this, request, response)
      }

      if (request.method === 'OPTIONS') {
        return null
      }

      return await this.execRoute(request, response, await import('../routes/main.js'))
    } catch (error: any) {
      const encodeError: (error: Error) => ServerError = (error) => {
        const encoded: ServerError = {
          name: error.name,
          message: error.message,
          stack: error.stack
        }

        if (error.cause != null) {
          encoded.cause = encodeError(error.stack as unknown as Error)
        }

        return encoded
      }

      return {
        status: error.status ?? 500,
        error: encodeError(error)
      }
    }
  }

  public async execRoute (request: Express.Request, response: Express.Response, route: { default: ServerRoute }): Promise<ServerResponse | null> {
    return await route.default(this, request, response)
  }

  public createResponse (status: number, data?: Record<string, any> | Error): ServerResponse {
    if (data instanceof Error) {
      throw Object.assign(data, status)
    }

    return { status, data }
  }

  public leanDocument<T>(document: Document<T>): Record<string, any> {
    const object = { ...document.toJSON() } as unknown as any

    delete object.__v

    return object
  }
}

export class ResponseError extends Error {
  public constructor (status: number, message?: string) {
    super(message)

    this.#status = status
  }

  #status: number
  public get status (): number { return this.#status }
}
