import * as fs from 'fs/promises'

import {
  Chat,
  Contact,
  GroupChat,
  Message,
  MessageMedia
} from 'whatsapp-web.js'

import { waClient } from '..'
import { botOptions, stickerMeta } from '../config'
import {
  addCount,
  ban,
  getCount,
  getDonors,
  unban
} from '../handlers/dbHandler'
import { getGiphys } from '../handlers/giphyHandler'
import { getMemeList, makeMeme } from '../handlers/memeHandler'
import { getStickerSearches } from '../handlers/stickerHandler'
import { getTenors } from '../handlers/tenorHandler'
import { convertToWebp, proxyImage } from '../utils/utils'

import { ask } from './aiHandler'
import { synthesizeText } from './speechHandler'

export const handleText = async (
  message: Message,
  chat: Chat,
  group: GroupChat | undefined,
  isOwner: boolean,
  isAdmin: boolean
) => {
  // Get Action from Text
  const action = await getTextAction(message.body)

  if (action) {
    // Add to Statistics
    addCount(action)
    // Start typing
    await chat.sendStateTyping()
    await message.react('🤖')

    switch (action) {
      case actions.INSTRUCTIONS:
        console.log('Sending instructions')

        if (group) {
          await message.reply(group.description)
        } else {
          await message.reply('¯\\_(ツ)_/¯')
        }
        break

      case actions.LINK:
        if (!group) return
        console.log('Sending Link')

        await message.reply(
          `https://chat.whatsapp.com/${await group.getInviteCode()}`
        )
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

        try {
          const url = await makeMeme(message.body)
          const media = await MessageMedia.fromUrl(url)
          media.data = <string>await convertToWebp(media.data)
          await message.reply(media, undefined, stickerMeta)
          await message.reply(await MessageMedia.fromUrl(url))
        } catch (error) {
          console.error(error)
        }
        break

      case actions.TEXT:
        try {
          const text = message.body.slice(6)
          const endpoints = ['ttp', 'attp']
          for (const endpoint of endpoints) {
            const url = `https://api.helv.io/${endpoint}?text=${encodeURIComponent(
              text
            )}`
            const media = await MessageMedia.fromUrl(url, { unsafeMime: true })
            await chat.sendMessage(media, stickerMeta)
          }
        } catch (e) {
          console.error(e)
          await chat.sendMessage('👎')
        }
        break

      case actions.SYNTH:
        let file = ''
        try {
          const synth = message.body.slice(6)
          file = await synthesizeText(synth)
          const voiceMedia = await MessageMedia.fromFilePath(file)
          await message.reply(voiceMedia, undefined, { sendAudioAsVoice: true })
        } catch (error) {
          console.error(error)
        } finally {
          await fs.unlink(file)
        }
        break

      case actions.STICKER:
        const searches = getStickerSearches(message.body)
        console.log('Sending Stickers for', searches.giphySearch.q)

        const giphyURLs = await getGiphys(searches.giphySearch)
        const tenorURLs = await getTenors(searches.tenorSearch)
        const urls = giphyURLs.concat(tenorURLs)

        for (const url of urls) {
          try {
            const media = await proxyImage(url)
            await chat.sendMessage(media, stickerMeta)
          } catch (error) {
            console.error(error)
          }
        }
        break

      case actions.BAN:
        if (isOwner || isAdmin) {
          const user = message.body.slice(4).replace(/\D/g, '')
          await ban(user)
          await message.react('👎')
        }
        break

      case actions.UNBAN:
        if (isOwner || isAdmin) {
          const user = message.body.slice(6).replace(/\D/g, '')
          await unban(user)
          await message.react('👍')
        }
        break

      case actions.AI:
        try {
          const question = message.body.slice(5)
          console.log(question)
          const name = (await message.getContact()).pushname
          const response = `${name},${(await ask(question)) || ''}`
          await message.reply(response)
        } catch (e) {
          await message.reply('👎')
        }
        break

      case actions.ALL:
        if (group) {
          const broadcast = message.body.slice(5)
          console.log('Broadcast', broadcast)
          const contacts: Contact[] = []
          let mentions = ''
          for (const participant of group.participants) {
            const contact = await waClient.getContactById(
              participant.id._serialized
            )

            contacts.push(contact)
            mentions += `@${participant.id.user} `
          }
          await message.delete(true)
          await chat.sendMessage(`${mentions.trim()}\n${broadcast}`, {
            mentions: contacts
          })
        }
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
    if (message === 'rtfm') return actions.INSTRUCTIONS
    if (stickerRegExp.exec(message)) return actions.STICKER
    if (message.startsWith('meme ')) return actions.MEME
    if (message.startsWith('texto ')) return actions.TEXT
    if (message.startsWith('bot, ')) return actions.AI
    if (message.startsWith('ban ')) return actions.BAN
    if (message.startsWith('unban ')) return actions.UNBAN
    if (message.startsWith('synth ')) return actions.SYNTH
    if (message.startsWith('@all ')) return actions.ALL
  }
}

export enum actions {
  MEME_LIST = 'Meme List',
  MEME = 'Memes',
  INSTRUCTIONS = 'Instructions',
  STICKER = 'Stickers',
  LINK = 'Link',
  STATS = 'Statistics',
  TEXT = 'Text',
  AI = 'AI',
  BAN = 'Ban',
  UNBAN = 'Unban',
  SYNTH = 'Speak',
  ALL = 'Broadcast'
}
