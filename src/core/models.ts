import type Mongoose from 'mongoose'

import { type Server } from './server.js'

export interface BaseResource {
  createTime: number
  updateTime: number
}

export interface Account extends BaseResource {
  username: string
  password: string
}

export interface Session extends BaseResource {
  accountId: StringConstructor
  lastActivity: bigint
}

export interface UploadToken extends BaseResource {}

export interface File extends BaseResource {
  size: number

  completed: boolean
}

export interface FileBuffer extends BaseResource {
  fileId: string
  blockSize: number

  data: Uint8Array
}

export interface News extends BaseResource {
  title: string

  thumbnail: string
}

export enum NewsContentType {
  Image, Text, Link
}

export interface NewsContent extends BaseResource {
  newsId: string

  contentType: NewsContentType
}

export interface NewsImageContent extends NewsContent {
  contentType: NewsContentType.Image

  url: string
}

export interface NewsTextContent extends NewsContent {
  contentType: NewsContentType.Text

  content: string
}

export interface NewsLinkContent extends NewsContent {
  contentType: NewsContentType.Link

  name: string
  link: string
}

export interface Picture extends BaseResource {
  fileId: string
}

export interface Discography extends BaseResource {
}

export interface Schedule extends BaseResource {
}

export type Document<T> = (Mongoose.Document<unknown, Record<string, unknown>, T> & Omit<Account & Required<{
  _id: Mongoose.ObjectId
}>, never>)

export class Models {
  public constructor (server: Server, mongoose: Mongoose.Mongoose) {
    this.#server = server
    this.#mongoose = mongoose

    const baseResourceSchema = new mongoose.Schema<BaseResource>({
      createTime: { type: Number, required: true },
      updateTime: { type: Number, required: true }
    })

    this.Account = mongoose.model('Account', new mongoose.Schema<Account>({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true }
    }).add(baseResourceSchema))

    this.Session = mongoose.model('Session', new mongoose.Schema<Session>({
      accountId: { type: String, required: true },
      lastActivity: { type: BigInt, required: true }
    }))

    this.UploadToken = mongoose.model('UploadToken', new mongoose.Schema<UploadToken>({

    }).add(baseResourceSchema))

    this.File = mongoose.model('File', new mongoose.Schema<File>({
      size: { type: Number, required: true }
    }).add(baseResourceSchema))

    this.FileBuffer = mongoose.model('FileBuffer', new mongoose.Schema<FileBuffer>({
      fileId: { type: String, required: true },
      blockSize: { type: Number, required: true },
      data: { type: Buffer, required: true }
    }).add(baseResourceSchema))

    this.News = mongoose.model('News', new mongoose.Schema<News>({
      title: { type: String, required: true },
      thumbnail: { type: String, required: true }
    }).add(baseResourceSchema))

    this.NewsContent = mongoose.model('NewsContent', new mongoose.Schema({
      newsId: { type: String, required: true },
      contentType: { type: Number, required: true },

      url: { type: String, required: false },
      name: { type: String, required: false },
      link: { type: String, required: false },
      content: { type: String, required: false }
    }).add(baseResourceSchema)) as unknown as Mongoose.Model<NewsContent>

    this.Picture = mongoose.model('Picture', new mongoose.Schema<Picture>({
      fileId: { type: String, required: true }
    }).add(baseResourceSchema))
  }

  #server: Server
  #mongoose: Mongoose.Mongoose

  public async init (url: URL, options?: Mongoose.MongooseOptions): Promise<void> {
    await this.#mongoose.connect(url.toString(), options)
  }

  Account: Mongoose.Model<Account>
  Session: Mongoose.Model<Session>
  UploadToken: Mongoose.Model<UploadToken>
  File: Mongoose.Model<File>
  FileBuffer: Mongoose.Model<FileBuffer>
  News: Mongoose.Model<News>
  NewsContent: Mongoose.Model<NewsContent>
  Picture: Mongoose.Model<Picture>
}
