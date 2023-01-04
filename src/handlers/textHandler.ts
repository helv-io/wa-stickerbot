
import Jimp from 'jimp'
import { Buttons, Message, MessageMedia } from 'whatsapp-web.js'

import { chat, group, isAdmin, isOwner } from '..'
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
  message: Message
) => {
  // Get Action from Text
  const action = await getTextAction(message.body)

  if (action) {
    // Start typing
    await chat.sendStateTyping()
    await message.react('🤖')

    switch (action) {
      case actions.INSTRUCTIONS:
        console.log('Sending instructions')

        if (chat.isGroup) {
          await message.reply(group.description)
        } else {
          await message.reply('¯\\_(ツ)_/¯')
        }
        break

      case actions.LINK:
        if (chat.isGroup) return
        console.log('Sending Link')

        await message.reply(await group.getInviteCode())
        break

      case actions.MEME_LIST:
        console.log('Sending meme list')

        await message.reply(await getMemeList())
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

        await message.reply(stats)
        break

      case actions.MEME:
        console.log(`Sending (${message.body.split('\n').join(')(')})`)
        addCount('Memes')

        const url = await makeMeme(message.body)
        const media = await MessageMedia.fromUrl(url, { unsafeMime: true })
        media.mimetype = 'image/gif'
        await chat.sendMessage(media, stickerMeta)
        break

      case actions.TEXT:
        const text = message.body.slice(6)
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
          const b64 = (await image.getBase64Async(Jimp.MIME_PNG)).split(';base64,').pop() || ''
          try {
            return await chat.sendMessage(new MessageMedia('image/png', b64), stickerMeta)
          } catch (err) {
            console.log(err)
          }
        })
        break

      case actions.STICKER:
        const searches = getStickerSearches(message.body)

        console.log('Sending Stickers for', searches.giphySearch.q)

        const giphyURLs = await getGiphys(searches.giphySearch)
        const tenorURLs = await getTenors(searches.tenorSearch)

        giphyURLs.concat(tenorURLs).forEach(async (url) => {
          try {
            const media = await MessageMedia.fromUrl(url)
            media.mimetype = 'image/webp'
            await chat.sendMessage(media, stickerMeta)
            addCount('Stickers')
          } catch { }
        })
        break

      case actions.DONOR:
        if (isOwner) {
          const name = message.body.slice(10)
          await addDonor(name)
          await message.reply(`💰${name}`)
          const donorList = await getDonors()
          await chat.sendMessage(donorList)
        }
        break

      case actions.BAN:
        if (isOwner || isAdmin) {
          const user = message.body.slice(4).replace(/\D/g, '')
          await ban(user)
          await message.reply(`${user} banned`)
        }
        break

      case actions.UNBAN:
        if (isOwner || isAdmin) {
          const user = message.body.slice(6).replace(/\D/g, '')
          await unban(user)
          await message.reply(`${user} unbanned`)
        }
        break

      case actions.AI:
        const question = message.body.slice(5)
        console.log(question)
        const name = (await message.getContact()).pushname
        const response = `${name},${(await ask(question)) || ''}`
        await message.reply(response)
        addCount('AI')
        break

      case actions.BUTTON:
        const buttons = new Buttons('body', [{ id: 'y', body: 'yes' }, { id: 'n', body: 'no' }], 'title', 'footer')
        await chat.sendMessage(buttons)
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
    if (message === 'button') return actions.BUTTON
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
  UNBAN,
  BUTTON
}
