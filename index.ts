#!/usr/bin/env ts-node

import { groupChangeEvent } from '@open-wa/wa-automate/dist/api/model/group-metadata'
import {
  create,
  Client,
  MessageTypes,
  Message,
  ChatId
} from '@open-wa/wa-automate'

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
  if (botOptions.interactIn || botOptions.interactOut) {
    void client.getAllGroups().then((groups) => {
      groups.forEach((group) => {
        const groupId = (group.id as unknown) as `${number}-${number}@g.us`
        void client.onParticipantsChanged(groupId, async (event) => {
          switch (event.action) {
            case groupChangeEvent.remove: {
              console.log('Removed', event.who)
              client.sendImage(
                groupId,
                await getImgflipImage(`${botOptions.outMessage}${event.who}`),
                '',
                'Adeus virgem'
              )
              break
            }
            case groupChangeEvent.add: {
              console.log('Added', event.who)
              client.sendImage(
                groupId,
                await getImgflipImage(`${botOptions.inMessage}${event.who}`),
                '',
                'Divirta-se!'
              )
              break
            }
          }
        })
      })
    })
  }

  void client.onMessage(async (message) => {
    // Skips personal chats unless specified
    if (message.isGroupMsg && botOptions.groupsOnly) return

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
        client.sendText(message.from, botOptions.instructions)
        break
      }

      case actions.MEME_LIST: {
        console.log('Sending meme list')
        client.sendText(message.from, await getImgflipList())
        break
      }

      case actions.MEME: {
        console.log(`Sending (${message.body.split('\n').join(')(')})`)
        const url = await getImgflipImage(message.body)
        client.sendImage(message.from, url, 'imgflip', url)
        client.sendStickerfromUrl(message.from, url, undefined, stickerMeta)
        break
      }

      case actions.STICKER: {
        const searches = getStickerSearches(message.body)
        console.log('Sending Stickers for', searches.giphySearch.q)
        const giphyURLs = await getGiphys(searches.giphySearch)
        const tenorURLs = await getTenors(searches.tenorSearch)

        if (giphyURLs)
          client.sendImageAsSticker(
            message.from,
            'attributions/giphy.gif',
            stickerMeta
          )
        if (tenorURLs) {
          client.sendImageAsSticker(
            message.from,
            'attributions/tenor.png',
            stickerMeta
          )
        }

        giphyURLs
          .concat(tenorURLs)
          .forEach((url) =>
            client.sendStickerfromUrl(message.from, url, undefined, stickerMeta)
          )
        break
      }
    }
  })

  // Click "Use Here" when another WhatsApp Web page is open
  void client.onStateChanged((state) => {
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      void client.forceRefocus()
    }
  })
}

void create(clientConfig).then((client: Client) => start(client))
