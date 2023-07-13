import * as fs from 'fs/promises'

import {
  GroupMetadata,
  MiscMessageGenerationOptions,
  WAMessage,
  WA_DEFAULT_EPHEMERAL
} from '@whiskeysockets/baileys'

import { client, ephemeral } from '../bot.js'
import { botOptions, stickerMeta } from '../config.js'
import {
  addCount,
  ban,
  getCount,
  getDonors,
  unban
} from '../handlers/dbHandler.js'
import { getGiphys } from '../handlers/giphyHandler.js'
import { getMemeList, makeMeme } from '../handlers/memeHandler.js'
import { getStickerSearches } from '../handlers/stickerHandler.js'
import { getTenors } from '../handlers/tenorHandler.js'
import { deleteMessage, react, makeSticker, imagine } from '../utils/baileysHelper.js'

import { synthesizeText } from './speechHandler.js'
import Sticker from 'wa-sticker-formatter'

export const handleText = async (
  message: WAMessage,
  body: string,
  group: GroupMetadata | undefined,
  isOwner: boolean,
  isAdmin: boolean
) => {
  // Mark all messages as read
  await client.readMessages([message.key])

  // Fix remote Jid - will never be empty
  const jid = message.key.remoteJid || ''

  // Easy quote
  const quote: MiscMessageGenerationOptions = {
    quoted: message,
    ephemeralExpiration: WA_DEFAULT_EPHEMERAL
  }

  // Get Action from Text
  const action = await getTextAction(body)

  if (action) {
    // Add to Statistics
    addCount(action)

    switch (action) {
      case actions.INSTRUCTIONS:
        console.log('Sending instructions')

        if (group) {
          await client.sendMessage(
            jid,
            { text: group.desc || '¯\\_(ツ)_/¯' },
            quote
          )
        } else {
          await client.sendMessage(jid, { text: '¯\\_(ツ)_/¯' }, quote)
        }
        break

      case actions.LINK:
        if (!group) return
        await react(message, '🤖')
        console.log('Sending Link')

        const code = await client.groupInviteCode(group.id)

        await client.sendMessage(
          jid,
          { text: `https://chat.whatsapp.com/${code}` },
          quote
        )
        break

      case actions.MEME_LIST:
        await react(message, '🤖')
        console.log('Sending meme list')

        await client.sendMessage(jid, { text: await getMemeList() }, quote)
        break

      case actions.STATS:
        await react(message, '🤖')
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

        if (botOptions.donationLink) {
          stats += `Donation:\n`
          stats += botOptions.donationLink
          stats += `\n\n${await getDonors()}`
        }

        await client.sendMessage(jid, { text: stats }, quote)
        break

      case actions.MEME:
        await react(message, '🤖')
        console.log(`Sending (${body.split('\n').join(')(')})`)

        try {
          const url = await makeMeme(body)
          await makeSticker(message, url)
        } catch (error) {
          console.error(error)
        }
        break

      case actions.TEXT:
        await react(message, '🤖')
        try {
          const text = body.slice(6)
          const endpoints = ['ttp', 'attp']
          for (const endpoint of endpoints) {
            const url = `https://api.helv.io/${endpoint}?text=${encodeURIComponent(
              text
            )}`
            await makeSticker(message, url)
          }
        } catch (e) {
          console.error(e)
          await client.sendMessage(jid, { text: '👎' }, quote)
        }
        break

      case actions.SYNTH:
        await react(message, '🤖')
        let file = ''
        try {
          const synth = body.slice(6)
          file = await synthesizeText(synth)
          await client.sendMessage(
            jid,
            { audio: { url: file }, ptt: true },
            quote
          )
        } catch (error) {
          console.error(error)
        } finally {
          await fs.unlink(file)
        }
        break

      case actions.AI:
        await react(message, '⏳')
        const prompt = body.slice(4)
        console.log(`Stable Diffusion: ${prompt}`)
        try {
          const payload = {
            prompt,
            steps: 20,
            restore_faces: true
          }
          const url = `https://ai.helv.io/sdapi/v1/txt2img`
          const dream = await imagine(url, JSON.stringify(payload))
          await react(message, '🤖')
          await client.sendMessage(jid, await new Sticker(dream, stickerMeta).toMessage(), quote)
          await client.sendMessage(jid, { image: dream }, quote)
        } catch (e) {
          console.error(e)
          await react(message, '👎')
        }
        break

      case actions.STICKER:
        await react(message, '🤖')
        const searches = getStickerSearches(body)
        console.log('Sending Stickers for', searches.giphySearch.q)

        const giphyURLs = await getGiphys(searches.giphySearch)
        const tenorURLs = await getTenors(searches.tenorSearch)

        // Shuffle array of URLs to make the results more uniform
        const urls = giphyURLs.concat(tenorURLs).sort(() => 0.5 - Math.random())

        console.log('Giphy and Tenor URLs:')

        for (const url of urls) {
          try {
            await makeSticker(message, url)
          } catch (error) {
            console.error(url)
            console.error(error)
          }
        }
        break

      case actions.BAN:
        if (isOwner || isAdmin) {
          const user = body.slice(4).replace(/\D/g, '')
          await ban(user)
          await react(message, '👎')
        }
        break

      case actions.UNBAN:
        if (isOwner || isAdmin) {
          const user = body.slice(6).replace(/\D/g, '')
          await unban(user)
          await react(message, '👍')
        }
        break

      case actions.ALL:
        if (group) {
          let broadcast = body.slice(5)
          console.log('Broadcast', broadcast)
          const mentions = []
          broadcast += '\n\n'
          for (const participant of group.participants) {
            mentions.push(participant.id)
            broadcast += `@${participant.id.split('@')[0]} `
          }
          await deleteMessage(message)
          await client.sendMessage(
            jid,
            { text: broadcast, mentions },
            ephemeral
          )
        }
        break
    }
  }
}

export const stickerRegExp = /(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i

// Attempt to match a message body with an action
export const getTextAction = async (message: string) => {
  if (message) {
    message = message.toLowerCase()

    // Exact matches
    if (message === 'stats') return actions.STATS
    if (message === 'memes') return actions.MEME_LIST
    if (message === 'link') return actions.LINK
    if (message === 'rtfm') return actions.INSTRUCTIONS

    // Starts With matches
    if (message.startsWith('meme ')) return actions.MEME
    if (message.startsWith('texto ')) return actions.TEXT
    if (message.startsWith('ban ')) return actions.BAN
    if (message.startsWith('unban ')) return actions.UNBAN
    if (message.startsWith('synth ')) return actions.SYNTH
    if (message.startsWith('/ai ')) return actions.AI
    if (message.startsWith('@all ')) return actions.ALL

    // RegExp matches
    if (stickerRegExp.exec(message)) return actions.STICKER
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
  BAN = 'Ban',
  UNBAN = 'Unban',
  SYNTH = 'Speak',
  AI = 'AI',
  ALL = 'Broadcast'
}
