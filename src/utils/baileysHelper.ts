import { downloadMediaMessage, WAMessage } from '@adiwajshing/baileys'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

import { client, ephemeral } from '../bot'
import { stickerMeta } from '../config'

export const react = async (message: WAMessage, emoji: string) => {
  const jid = message.key.remoteJid || ''
  const reaction = { react: { text: emoji, key: message.key } }
  await client.sendMessage(jid, reaction)
}

export const deleteMessage = async (message: WAMessage) => {
  const jid = message.key.remoteJid || ''
  await client.sendMessage(jid, { delete: message.key })
}

export const makeSticker = async (message: WAMessage, url = '') => {
  await react(message, '🤖')
  const jid = message.key.remoteJid || ''
  if (url) {
    const sticker = new Sticker(url, stickerMeta)
    client.sendMessage(jid, await sticker.toMessage(), ephemeral)
  } else {
    const buffer = <Buffer>await downloadMediaMessage(message, 'buffer', {})

    const types = [
      StickerTypes.DEFAULT,
      StickerTypes.CIRCLE,
      StickerTypes.ROUNDED
    ]

    for (const type of types) {
      const meta = stickerMeta
      meta.type = type
      const sticker = new Sticker(buffer, meta)

      client.sendMessage(jid, await sticker.toMessage(), ephemeral)
    }
  }
}
