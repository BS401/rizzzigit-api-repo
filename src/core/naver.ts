import type Mongoose from 'mongoose'
import RepAndRip from '@repandrip/core'
import Naver from '@repandrip/naver-scraper'
import NaverPolling from '@repandrip/polling-naver'
import Polling from '@repandrip/polling-core'
import Crypto from 'crypto'
import FS from 'fs'

import { Client } from 'adswebsitewrapper'

import { type Server } from './server.js'
import { NewsContentType } from './models.js'

export class NaverPollingClient {
  public constructor (server: Server, mongoose: Mongoose.Mongoose) {
    this.#server = server
    this.#client = new RepAndRip.Client({
      downloadParallelCount: 5
    })
    this.#mongoose = mongoose
    this.#polling = new Polling.Polling(this.#client, (() => {
      const ConfigModel = mongoose.model('config', new mongoose.Schema<{
        key: string
        value: any
      }>({
        key: { type: String, required: true },
        value: { type: Object, required: false }
      }))

      return {
        set: async (key, value) => {
          await ConfigModel.deleteMany({ key })
          await ConfigModel.create({ key, value })
        },
        get: async (key) => { return (await ConfigModel.findOne({ key }))?.value },
        isset: async (key) => { return await ConfigModel.exists({ key }) != null },
        unset: async (key) => { await ConfigModel.deleteMany({ key }) }
      }
    })())
    this.#naver = new Naver.Client(this.#client)
    this.#naverPolling = new NaverPolling.PollingWorker(this.#polling)

    this.#client.on('debug', (message) => {
      if (!message.includes('Request Manager')) {
        return
      }

      console.log(`[${Date.now()}] ${message}`)
    })

    void this.#init()
  }

  #server: Server
  #client: RepAndRip.Client
  #mongoose: Mongoose.Mongoose
  #polling: Polling.Polling
  #naver: Naver.Client
  #naverPolling: NaverPolling.PollingWorker

  async #init (): Promise<void> {
    const client = new Client({
      storage: (() => {
        let object: Record<string, any> = {}

        return {
          clear: () => {
            object = {}
          },

          getItem: (key: string) => object[key],
          setItem: (key: string, value: any) => { object[key] = value },
          length: 0,
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          removeItem: (key: string) => { delete object[key] },
          key: (index: number) => { return Object.keys(object)[index] }
        }
      })()
    })

    await client.resources.authentication.login(process.env.ADMIN_USERNAME as string, process.env.ADMIN_PASSWORD as string)
    const naverWorker = this.#naverPolling
    const subscription = naverWorker.map.series.twice = new NaverPolling.SeriesSubscription(naverWorker, await this.#naver.getSeries(29747755, 517466) as Naver.Series)

    await this.#polling.add(this.#naverPolling)

    const onPost = async (post: Naver.Post): Promise<void> => {
      const { models: { News, NewsContent } } = this.#server

      const thumbnail: string | null = await (async () => {
        if (Array.isArray(post.body)) {
          for (const entry of post.body) {
            if (entry.type === 'image') {
              const dest = `/tmp/${Crypto.randomInt(10000)}.${Date.now()}`
              try {
                await entry.download('thumb', dest)
                const buffer = await FS.promises.readFile(dest)

                console.log('Uploading downloaded file.')

                const file = await client.resources.files.upload(Uint8Array.from(buffer))
                return file.id
              } catch (e) {
                console.log(e)
              } finally {
                if (FS.existsSync(dest)) {
                  FS.unlinkSync(dest)
                }
              }
            }
          }
        } else {
          console.log(`Post ${post.ID} is skipped.`)
        }

        return null
      })()

      if (thumbnail == null) {
        return
      }
      console.log(`Thumbnail for news: ${post.ID} ${thumbnail}`)

      const news = await News.create({
        createTime: Date.now(),
        updateTime: Date.now(),

        title: post.title,
        thumbnail
      })

      console.log(`News ID: ${news.id as string}`)
      if (Array.isArray(post.body)) {
        for (const postContent of post.body) {
          switch (postContent.type) {
            case 'text': {
              await NewsContent.create({
                createTime: Date.now(),
                updateTime: Date.now(),

                newsId: news.id,
                contentType: NewsContentType.Text,
                content: postContent.content
              })

              break
            }

            case 'image': {
              const dest = `/tmp/${Crypto.randomInt(10000)}.${Date.now()}`

              try {
                await postContent.download('thumb', dest)
                const buffer = await FS.promises.readFile(dest)

                const file = await client.resources.files.upload(Uint8Array.from(buffer))

                await NewsContent.create({
                  createTime: Date.now(),
                  updateTime: Date.now(),

                  newsId: news.id,
                  contentType: NewsContentType.Image,
                  url: file.rawUrl.toString()
                })
              } catch {} finally {
                if (FS.existsSync(dest)) {
                  FS.unlinkSync(dest)
                }
              }
              break
            }

            case 'link': {
              await NewsContent.create({
                createTime: Date.now(),
                updateTime: Date.now(),

                newsId: news.id,
                contentType: NewsContentType.Link,
                name: postContent.link.toString(),
                link: postContent.link.toString()
              })
              break
            }
          }
        }
      }
    }

    subscription.events.on('post', async (post) => { await onPost(post) })

    void (async () => {
      while (true) {
        await subscription.update()

        await new Promise<void>((resolve) => setTimeout(resolve, 30000))
      }
    })()
  }
}
