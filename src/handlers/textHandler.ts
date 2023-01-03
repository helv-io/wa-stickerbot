import { GroupChatId, Message } from '@open-wa/wa-automate'
import Jimp from 'jimp'

import { isAdmin, isOwner, waClient } from '..'
import { botOptions, stickerMeta } from '../config'
import {
  addCount,
  addDonor,
  ban,
  getCount,
  getDonors,
  unban
} from '../handlers/dbHandler'
import { getGiphys } from '../handlers/giphyHandler'
import { getMemeList, makeMeme } from '../handlers/memeHandler'
import { getStickerSearches } from '../handlers/stickerHandler'
import { getTenors } from '../handlers/tenorHandler'

import { ask } from './aiHandler'

export const handleText = async (
  message: Message,
  groupId: GroupChatId | null
) => {
  // Get Action from Text
  const action = await getTextAction(message.body)

  if (action) {
    // Start typing
    await waClient.simulateTyping(message.from, true)

    switch (action) {
      case actions.INSTRUCTIONS:
        console.log('Sending instructions')

        if (groupId) {
          const groupInfo = await waClient.getGroupInfo(groupId)
          await waClient.sendText(message.from, groupInfo.description)
        } else {
          await waClient.sendText(message.from, '¯\\_(ツ)_/¯')
        }
        break

      case actions.LINK:
        if (!groupId) return
        console.log('Sending Link')

        await waClient.sendText(
          message.from,
          await waClient.getGroupInviteLink(message.from)
        )
        break

      case actions.MEME_LIST:
        console.log('Sending meme list')

        await waClient.sendText(message.from, await getMemeList())
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

        await waClient.sendText(message.from, stats)
        break

      case actions.MEME:
        console.log(`Sending (${message.body.split('\n').join(')(')})`)
        addCount('Memes')

        const url = await makeMeme(message.body)
        await waClient.sendImageAsSticker(message.from, url, stickerMeta)
        break

      case actions.TEXT:
        const text = message.body.slice(6)
        try {
          const textUrlA = `https://api.xteam.xyz/attp?text=${encodeURIComponent(
            text
          )}`
          const textUrlS = `https://api.xteam.xyz/ttp?text=${encodeURIComponent(
            text
          )}`
          console.log(`Sending (${text})`)
          addCount('Text')

          const b64a: { status: number; result: string } = await (
            await fetch(textUrlA)
          ).json()
          const b64s: { status: number; result: string } = await (
            await fetch(textUrlS)
          ).json()

          if (b64a.status === 200)
            await waClient.sendImageAsSticker(
              message.from,
              b64a.result,
              stickerMeta
            )
          if (b64s.status === 200)
            await waClient.sendImageAsSticker(
              message.from,
              b64s.result,
              stickerMeta
            )
        } catch {
          const size = 256
          new Jimp(size, size, async (_err, image) => {
            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
            image.print(
              font,
              0,
              0,
              {
                text: text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
              },
              size,
              size
            )
            return await waClient.sendImageAsSticker(
              message.from,
              await image.getBase64Async(Jimp.MIME_PNG),
              stickerMeta
            )
          })
        }

        break

      case actions.STICKER:
        const searches = getStickerSearches(message.body)

        console.log('Sending Stickers for', searches.giphySearch.q)

        const giphyURLs = await getGiphys(searches.giphySearch)
        const tenorURLs = await getTenors(searches.tenorSearch)

        giphyURLs.concat(tenorURLs).forEach(async (url) => {
          try {
            await waClient.sendStickerfromUrl(
              message.chatId,
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
          await waClient.reply(message.from, `💰${name}`, message.id)
          const donorList = await getDonors()
          await waClient.sendText(message.from, donorList)
        }
        break

      case actions.BAN:
        if (isOwner || isAdmin) {
          const user = message.body.slice(4).replace(/\D/g, '')
          await ban(user)
          await waClient.reply(message.chatId, `${user} banned`, message.id)
        }
        break

      case actions.UNBAN:
        if (isOwner || isAdmin) {
          const user = message.body.slice(6).replace(/\D/g, '')
          await unban(user)
          await waClient.reply(message.chatId, `${user} unbanned`, message.id)
        }
        break

      case actions.AI:
        const question = message.body.slice(5)
        console.log(question)
        const response = `${message.sender.pushname.split(' ')[0]},${
          (await ask(question, message.sender.id)) || ''
        }`
        await waClient.sendReplyWithMentions(
          message.chatId,
          response,
          message.id
        )
        addCount('AI')
        break
    }
  }
}

export const stickerRegExp = /(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i

export const getTextAction = async (message: string) => {
  if (message) {
    message = message.toLowerCase()

    if (message === 'stats') return actions.STATS
    if (message === 'memes') return actions.MEME_LIST
    if (message === 'link') return actions.LINK
    if (message === 'instrucoes' || message === 'rtfm')
      return actions.INSTRUCTIONS
    if (stickerRegExp.exec(message)) return actions.STICKER
    if (message.startsWith('meme ')) return actions.MEME
    if (message.startsWith('texto ')) return actions.TEXT
    if (message.startsWith('add-donor ')) return actions.DONOR
    if (message.startsWith('bot, ')) return actions.AI
    if (message.startsWith('ban ')) return actions.BAN
    if (message.startsWith('unban ')) return actions.UNBAN
  }
}

export enum actions {
  MEME_LIST = 1,
  MEME,
  INSTRUCTIONS,
  STICKER,
  LINK,
  STATS,
  TEXT,
  DONOR,
  AI,
  BAN,
  UNBAN
}