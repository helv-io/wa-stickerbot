#!/usr/bin/env ts-node

import { create, Client } from '@open-wa/wa-automate'

import { botOptions, clientConfig, stickerMeta, circleMeta } from './config'
import { getImgflipList, getImgflipImage } from './utils/imgflipHandler'
import { getStickerSearches } from './utils/stickerHandler'
import { getGiphys } from './utils/giphyHandler'
import { getTenors } from './utils/tenorHandler'
import { getConversionOptions, WhatsappMedia } from './utils/mediaHandler'
import { actions, getTextAction } from './utils/textHandler'
import { oneChanceIn } from './utils/utils'
import { getCount, addCount, addDonor, getDonors } from './utils/dbHandler'
import {
  Message,
  MessageTypes
} from '@open-wa/wa-automate/dist/api/model/message'
import axios from 'axios'
import mime from 'mime-types'
import { ask } from './utils/aiHandler'

console.log('Environment Variables:')
console.log(process.env)

const start = async (client: Client) => {
  // Administered groups
  let adminGroups: (`${number}-${number}@g.us` | `${number}@g.us`)[] = []

  // Welcome Message
  if (botOptions.welcomeMessage) {
    await client.onGlobalParticipantsChanged(async (event) => {
      if (event.action === 'add') {
        const who = `${event.who.toString().split('@')[0]}:`
        await client.sendTextWithMentions(
          event.chat,
          `@${who}\n${botOptions.welcomeMessage}`
        )
      }
    })
  }

  // Message Handlers
  void client.onMessage(async (message: Message) => {
    const isOwner = message.sender.id.split('@')[0] === botOptions.ownerNumber
    // Get groupId
    const groupId = message.isGroupMsg ? message.chat.groupMetadata.id : ''
    // Adjust adminGroups
    if (groupId) {
      try {
        const me = await client.getMe()
        const admins = await client.getGroupAdmins(groupId)

        if (admins.indexOf(me.status) >= 0) {
          adminGroups.push(groupId)
          // Remove duplicates
          adminGroups = adminGroups.filter(
            (value, index, self) => self.indexOf(value) === index
          )
        } else {
          adminGroups = adminGroups.filter((v) => v !== groupId)
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Skips personal chats unless specified
    if (!groupId) {
      if (botOptions.groupsOnly) {
        return
      }
    } else {
      // Skips non-administered groups unless specified
      if (botOptions.groupAdminOnly) {
        if (!adminGroups.includes(groupId)) {
          return
        }
      }
    }

    if (
      message.type === MessageTypes.IMAGE ||
      message.type === MessageTypes.VIDEO ||
      message.type === MessageTypes.AUDIO ||
      message.type === MessageTypes.VOICE ||
      message.type === MessageTypes.STICKER
    ) {
      // Handles Media
      // Start typing
      await client.simulateTyping(message.from, true)

      const data = await client.decryptMedia(message)
      const media: WhatsappMedia = {
        dataURL: data,
        filename: `${message.t}.${
          mime.extension(message.mimetype || '') || ''
        }`,
        mediaData: Buffer.from(data)
      }

      if (message.type === MessageTypes.STICKER) {
        try {
          await client.sendImage(
            message.from,
            media.dataURL,
            media.filename,
            ''
          )
        } catch {}
      } else if (media.filename.endsWith('.mp4')) {
        // Sends as Video Sticker
        console.log('MP4/GIF Sticker', media.filename)
        addCount('Videos')

        for (let i = 15; i > 0; i--) {
          try {
            try {
              await client.sendMp4AsSticker(
                message.from,
                media.dataURL,
                getConversionOptions(i),
                stickerMeta
              )
            } catch {}

            try {
              await client.sendMp4AsSticker(
                message.from,
                media.dataURL,
                getConversionOptions(i),
                circleMeta
              )
            } catch {}
            break
          } catch {
            console.log(`Video is too long. Reducing length.`)
          }
        }
      } else if (media.filename.endsWith('.oga')) {
        try {
          await client.sendPtt(
            message.from,
            media.dataURL,
            'true_0000000000@c.us_JHB2HB23HJ4B234HJB'
          )
        } catch {}
      } else {
        // Sends as Image sticker
        console.log('IMAGE Sticker', media.filename)
        addCount('Images')

        try {
          await client.sendImageAsSticker(
            message.from,
            media.dataURL,
            stickerMeta
          )
        } catch {}
        try {
          await client.sendImageAsSticker(
            message.from,
            media.dataURL,
            circleMeta
          )
        } catch {}
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

          if (groupId) {
            const groupInfo = await client.getGroupInfo(groupId)
            await client.sendText(message.from, groupInfo.description)
          } else {
            await client.sendText(message.from, '¯_(ツ)_/¯')
          }
          break

        case actions.LINK:
          if (!groupId) return
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
          stats += `${await getCount('Images')}\n\n`

          stats += `GIFs and Videos\n`
          stats += `${await getCount('Videos')}\n\n`

          stats += `Memes\n`
          stats += `${await getCount('Memes')}\n\n`

          stats += `Stickers\n`
          stats += `${await getCount('Stickers')}\n\n`

          stats += `Text\n`
          stats += `${await getCount('Text')}\n\n`

          stats += `AI\n`
          stats += `${await getCount('AI')}\n\n`

          if (botOptions.donationLink) {
            stats += `Donation:\n`
            stats += botOptions.donationLink
            stats += `\n\n${await getDonors()}`
          }

          await client.sendText(message.from, stats)
          break

        case actions.MEME:
          console.log(`Sending (${message.body.split('\n').join(')(')})`)
          addCount('Memes')

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
          addCount('Text')

          const b64a: any = await axios.get(textUrlA)
          const b64s: any = await axios.get(textUrlS)

          try {
            if (b64a.status === 200)
              await client.sendImageAsSticker(
                message.from,
                b64a.data.result,
                stickerMeta
              )
          } catch {
            await client.reply(message.from, 'Offline 👎', message.id)
          }
          try {
            if (b64s.status === 200)
              await client.sendImageAsSticker(
                message.from,
                b64s.data.result,
                stickerMeta
              )
          } catch {
            await client.reply(message.from, 'Offline 👎', message.id)
          }

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
              addCount('Stickers')
            } catch {}
          })
          break

        case actions.DONOR:
          if (isOwner) {
            const name = message.body.slice(10)
            await addDonor(name)
            await client.reply(message.from, `💰${name}`, message.id)
            const donorList = await getDonors()
            await client.sendText(message.from, donorList)
          }
          break

        case actions.AI:
          const question = message.body.slice(5)
          console.log(question)
          console.log(message.sender)
          const response = `${message.sender.pushname.split(' ')[0]},${
            (await ask(question)) || ''
          }`
          await client.reply(message.from, response, message.id)
          addCount('AI')
          break
      }
    }

    // One chance in X to send a Donation link
    if (botOptions.donationLink && oneChanceIn(botOptions.donationChance)) {
      const donors = await getDonors()
      let msg = botOptions.donationLink
      if (donors) msg += `\n\n${await getDonors()}`
      await client.sendText(message.from, msg)
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

create(clientConfig).then((client) => start(client))
function ParticipantChangedEventModel(
  participantChangedEvent: any,
  ParticipantChangedEventModel: any
) {
  throw new Error('Function not implemented.')
}
