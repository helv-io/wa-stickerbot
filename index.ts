#!/usr/bin/env ts-node

import { create, Client, MessageTypes } from '@open-wa/wa-automate'

import http from 'http'
import io from '@pm2/io'
import pm2 from 'pm2'

import { botOptions, clientConfig, stickerMeta, circleMeta } from './config'
import { getImgflipList, getImgflipImage } from './utils/imgflipHandler'
import { getStickerSearches } from './utils/stickerHandler'
import { getGiphys } from './utils/giphyHandler'
import { getTenors } from './utils/tenorHandler'
import {
  getConversionOptions,
  getMedia,
  WhatsappMedia
} from './utils/mediaHandler'
import { actions, getTextAction } from './utils/textHandler'
import { registerParticipantsListener } from './utils/utils'
import axios from 'axios'

console.log('Environment Variables:')
console.log(process.env)

const start = (client: Client) => {
  // Usage Counters
  const ioImages = io.counter({
    name: 'Images',
    id: 'images'
  })

  const ioVideos = io.counter({
    name: 'GIFs and Videos',
    id: 'videos'
  })

  const ioMemes = io.counter({
    name: 'Memes',
    id: 'memes'
  })

  const ioStickers = io.counter({
    name: 'Stickers',
    id: 'sticker'
  })

  const ioRefreshes = io.counter({
    name: 'Refreshes',
    id: 'refreshes'
  })

  // Message Handlers
  void client.onMessage(async (message) => {
    const groupId = message.chatId as unknown as `${number}-${number}@g.us`

    // Skips personal chats unless specified
    if (!message.isGroupMsg && botOptions.groupsOnly) return

    // Handles Media
    if (
      message.type === MessageTypes.IMAGE ||
      message.type === MessageTypes.VIDEO
    ) {
      // Start typing
      await client.simulateTyping(message.from, true)

      const media: WhatsappMedia = await getMedia(message)

      if (media.filename.endsWith('.mp4')) {
        // Sends as Video Sticker
        console.log('MP4/GIF Sticker', media.filename)
        ioVideos.inc()

        for (let i = 15; i > 0; i--) {
          try {
            await client.sendMp4AsSticker(
              message.from,
              media.dataURL,
              getConversionOptions(i),
              stickerMeta
            )

            await client.sendMp4AsSticker(
              message.from,
              media.dataURL,
              getConversionOptions(i),
              circleMeta
            )
            break
          } catch {
            console.log(`Video is too long. Reducing length.`)
          }
        }
      } else {
        // Sends as Image sticker
        console.log('IMAGE Sticker', media.filename)
        ioImages.inc()

        await client.sendImageAsSticker(
          message.from,
          media.dataURL,
          stickerMeta
        )
        await client.sendImageAsSticker(message.from, media.dataURL, circleMeta)
      }
      return
    }

    // Handles Text Messages
    const action = await getTextAction(message.body)
    if (action) {
      // Start typing
      await client.simulateTyping(message.from, true)

      switch (action) {
        case actions.INSTRUCTIONS:
          console.log('Sending instructions')

          if (message.isGroupMsg) {
            const groupInfo = await client.getGroupInfo(groupId)
            await client.sendText(message.from, groupInfo.description)
          } else {
            await client.sendText(message.from, 'No Group Instructions.')
          }
          break

        case actions.LINK:
          if (!message.isGroupMsg) return
          console.log('Sending Link')

          await client.sendText(
            message.from,
            await client.getGroupInviteLink(message.from)
          )
          break

        case actions.MEME_LIST:
          console.log('Sending meme list')

          await client.sendText(message.from, await getImgflipList())
          break

        case actions.STATS:
          // Build stats text
          let stats = `*Current Usage*\n\n`

          stats += `Images\n`
          stats += `${ioImages.val()}\n\n`

          stats += `GIFs and Videos\n`
          stats += `${ioVideos.val()}\n\n`

          stats += `Memes\n`
          stats += `${ioMemes.val()}\n\n`

          stats += `Stickers\n`
          stats += `${ioStickers.val()}\n\n`

          stats += `Refreshes\n`
          stats += `${ioRefreshes.val()}\n\n`

          stats += `Reset on Bot Reboot or Update`

          await client.sendText(message.from, stats)
          break

        case actions.MEME:
          console.log(`Sending (${message.body.split('\n').join(')(')})`)
          ioMemes.inc()

          const url = await getImgflipImage(message.body)
          await client.sendImage(message.from, url, 'imgflip', url)
          await client.sendStickerfromUrl(
            message.from,
            url,
            undefined,
            stickerMeta
          )
          break

        case actions.TEXT:
          const text = message.body.slice(6)
          const textUrlA = `https://api.xteam.xyz/attp?text=${encodeURIComponent(
            text
          )}`
          const textUrlS = `https://api.xteam.xyz/ttp?text=${encodeURIComponent(
            text
          )}`
          console.log(`Sending (${text})`)
          ioStickers.inc()

          const b64a = (await axios.get(textUrlA)).data
          const b64s = (await axios.get(textUrlS)).data

          if (!b64a.error)
            await client.sendImageAsSticker(
              message.from,
              b64a.result,
              stickerMeta
            )
          if (!b64s.error)
            await client.sendImageAsSticker(
              message.from,
              b64s.result,
              stickerMeta
            )

          break

        case actions.STICKER:
          const searches = getStickerSearches(message.body)

          console.log('Sending Stickers for', searches.giphySearch.q)

          const giphyURLs = await getGiphys(searches.giphySearch)
          const tenorURLs = await getTenors(searches.tenorSearch)

          if (giphyURLs) {
            try {
              await client.sendImageAsSticker(
                message.from,
                'attributions/giphy.gif',
                stickerMeta
              )
            } catch { }
          }
          if (tenorURLs) {
            try {
              await client.sendImageAsSticker(
                message.from,
                'attributions/tenor.png',
                stickerMeta
              )
            } catch { }
          }

          giphyURLs.concat(tenorURLs).forEach(async (url) => {
            try {
              await client.sendStickerfromUrl(
                message.from,
                url,
                undefined,
                stickerMeta
              )
              ioStickers.inc()
            } catch { }
          })
          break
      }
    }

    // Stop typing
    await client.simulateTyping(message.from, false)
  })

  // Participants Handler
  registerParticipantsListener(client)

  // Click "Use Here" when another WhatsApp Web page is open
  void client.onStateChanged((state) => {
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      void client.forceRefocus()
    }
  })

  // Status / Reload / Restart Web Server
  http
    .createServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      const url = req.url?.toLowerCase()

      switch (url) {
        case '/restart': {
          pm2.restart('wa-stickerbot', () => { })
          console.log('Restarting wa-stickerbot...')
          res.end('Restarting wa-stickerbot...')
          break
        }
        case '/refresh': {
          await client.refresh()
          ioRefreshes.inc()
          console.log('Refreshed wa-stickerbot')
          res.end('Refreshed wa-stickerbot')
          break
        }
        default:
          res.end('Running')
      }
    })
    .listen(6001)
}

create(clientConfig).then((client: Client) => start(client))
