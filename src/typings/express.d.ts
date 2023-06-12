declare namespace Express {
  export interface Request {
    pathArray: string[]

    authentication: null | {
      session: import('../core/models.js').Document<import('../core/models.js').Session>
      account: import('../core/models.js').Document<import('../core/models.js').Account>
    }

    body: null | Record<string, any>
  }
}
