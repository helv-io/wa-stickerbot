#!/usr/bin/env ts-node

import { create, Client, MessageTypes } from '@open-wa/wa-automate'

import http from 'http'
import io from '@pm2/io'

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

const start = (client: Client) => {
  const ioImages = io.counter({
    name: 'Images',
    id: 'images'
  })

  const ioVideos = io.counter({
    name: 'Videos',
    id: 'videos'
  })

  const ioMemes = io.counter({
    name: 'Memes',
    id: 'memes'
  })

  const ioSticker = io.counter({
    name: 'Stickers',
    id: 'sticker'
  })

  // Interact with Entering / Exiting Participants
  client.onGlobalParticipantsChanged(async (event) => {
    const groupId = event.chat as unknown as `${number}-${number}@g.us`

    switch (event.action) {
      case 'remove': {
        console.log('Removed', event.who)
        if (botOptions.interactOut) {
          client.sendImage(
            groupId,
            await getImgflipImage(botOptions.outMessage),
            '',
            `Adeus +${event.who.toString().split('@')[0]}, vai tarde!`
          )
        }
        break
      }

      case 'add': {
        console.log('Added', event.who)
        if (botOptions.interactOut) {
          client.sendImage(
            groupId,
            await getImgflipImage(botOptions.inMessage),
            '',
            `Divirta-se, +${event.who.toString().split('@')[0]}!`
          )
          const groupInfo = await client.getGroupInfo(groupId)
          client.sendText(groupId, groupInfo.description)
        }
        break
      }
    }
  })

  void client.onMessage(async (message) => {
    const groupId = message.chatId as unknown as `${number}-${number}@g.us`

    // Skips personal chats unless specified
    if (!message.isGroupMsg && botOptions.groupsOnly) return

    // Start typing
    await client.simulateTyping(message.from, true)

    // Handles Media
    if (
      message.type === MessageTypes.IMAGE ||
      message.type === MessageTypes.VIDEO
    ) {
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
    switch (await getTextAction(message.body)) {
      case actions.INSTRUCTIONS: {
        console.log('Sending instructions')

        const groupInfo = await client.getGroupInfo(groupId)
        await client.sendText(message.from, groupInfo.description)
        break
      }

      case actions.LINK: {
        if (!message.isGroupMsg) return
        console.log('Sending Link')

        await client.sendText(
          message.from,
          await client.getGroupInviteLink(message.from)
        )
        break
      }

      case actions.MEME_LIST: {
        console.log('Sending meme list')

        await client.sendText(message.from, await getImgflipList())
        break
      }

      case actions.MEME: {
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
      }

      case actions.STICKER: {
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
          } catch {}
        }
        if (tenorURLs) {
          try {
            await client.sendImageAsSticker(
              message.from,
              'attributions/tenor.png',
              stickerMeta
            )
          } catch {}
        }

        giphyURLs.concat(tenorURLs).forEach(async (url) => {
          try {
            await client.sendStickerfromUrl(
              message.from,
              url,
              undefined,
              stickerMeta
            )
            ioSticker.inc()
          } catch {}
        })
        break
      }
    }

    // Stop typing
    await client.simulateTyping(message.from, false)
  })

  // Click "Use Here" when another WhatsApp Web page is open
  void client.onStateChanged((state) => {
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      void client.forceRefocus()
    }
  })
}

create(clientConfig).then((client: Client) => start(client))

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Running')
  })
  .listen(6001)
