import type Mongoose from 'mongoose'
import RepAndRip from '@repandrip/core'
import Naver from '@repandrip/naver-scraper'
import NaverPolling from '@repandrip/polling-naver'
import Polling from '@repandrip/polling-core'
import Crypto from 'crypto'
import FS from 'fs'

import { type Server } from './server.js'
import { NewsContentType } from './models.js'
import { Client, type PictureResource } from 'adswebsitewrapper'

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

      const c = {
        set: async (key: string, value: any): Promise<void> => {
          await ConfigModel.deleteMany({ key })
          await ConfigModel.create({ key, value })
        },
        get: async (key: string): Promise<any> => { return (await ConfigModel.findOne({ key }))?.value },
        isset: async (key: string): Promise<boolean> => { return await ConfigModel.exists({ key }) != null },
        unset: async (key: string): Promise<void> => { await ConfigModel.deleteMany({ key }) }
      }

      return c
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
      const contents: any[] = []

      if (Array.isArray(post.body)) {
        for (const postContent of post.body) {
          switch (postContent.type) {
            case 'text': {
              contents.push({
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

                contents.push({
                  contentType: NewsContentType.Image,
                  pictureId: (await client.resources.pictures.create(file)).id
                })
              } catch {} finally {
                if (FS.existsSync(dest)) {
                  FS.unlinkSync(dest)
                }
              }
              break
            }

            case 'link': {
              contents.push({
                contentType: NewsContentType.Link,
                name: postContent.link.toString(),
                link: postContent.link.toString()
              })
              break
            }
          }
        }
      }

      let thumbnail: string | null = null
      for (const content of contents) {
        if (content.contentType !== NewsContentType.Image) {
          continue
        }

        thumbnail = content.pictureId
      }

      if (thumbnail == null) {
        return
      }

      try {
        await client.resources.news.create(post.title, { id: thumbnail } as unknown as PictureResource, contents)
      } catch (e) {
        console.log(e)
      }
    }

    subscription.events.on('post', async (post) => { void onPost(post).catch(console.log) })

    void (async () => {
      while (true) {
        await subscription.update()

        await new Promise<void>((resolve) => setTimeout(resolve, 30000))
      }
    })()
  }
}
