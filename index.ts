#!/usr/bin/env ts-node

import { groupChangeEvent } from '@open-wa/wa-automate/dist/api/model/group-metadata'
import { create, Client, MessageTypes } from '@open-wa/wa-automate'

import { botOptions, clientConfig, stickerMeta } from './config'
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
  // Interact with Entering / Exiting Participants
  client.onGlobalParticipantsChanged(async (event) => {
    const groupId = (event.chat as unknown) as `${number}-${number}@g.us`
    switch (event.action) {
      case groupChangeEvent.remove: {
        console.log('Removed', event.who)
        client.sendImage(
          groupId,
          await getImgflipImage(botOptions.outMessage),
          '',
          `Adeus +${event.who.toString().split('@')[0]}, vai tarde!`
        )
        break
      }

      case groupChangeEvent.add: {
        console.log('Added', event.who)
        client.sendImage(
          groupId,
          await getImgflipImage(botOptions.inMessage),
          '',
          `Divirta-se, +${event.who.toString().split('@')[0]}!`
        )
        client.sendText(groupId, botOptions.instructions)
        break
      }
    }
  })

  void client.onMessage(async (message) => {
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

        for (let i = 15; i > 0; i--) {
          try {
            await client.sendMp4AsSticker(
              message.from,
              media.dataURL,
              getConversionOptions(i),
              stickerMeta
            )
            break
          } catch {
            console.log(`Video is too long. Reducing length.`)
          }
        }
      } else {
        // Sends as Image sticker
        console.log('IMAGE Sticker', media.filename)
        await client.sendImageAsSticker(
          message.from,
          media.dataURL,
          stickerMeta
        )
      }
      return
    }

    // Handles Text Messages
    switch (await getTextAction(message.body)) {
      case actions.INSTRUCTIONS: {
        console.log('Sending instructions')
        await client.sendText(message.from, botOptions.instructions)
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

        if (giphyURLs)
          await client.sendImageAsSticker(
            message.from,
            'attributions/giphy.gif',
            stickerMeta
          )
        if (tenorURLs) {
          await client.sendImageAsSticker(
            message.from,
            'attributions/tenor.png',
            stickerMeta
          )
        }

        giphyURLs
          .concat(tenorURLs)
          .forEach(
            async (url) =>
              await client.sendStickerfromUrl(
                message.from,
                url,
                undefined,
                stickerMeta
              )
          )
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

void create(clientConfig).then((client: Client) => start(client))
