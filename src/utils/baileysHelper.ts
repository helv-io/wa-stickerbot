import { downloadMediaMessage, WAMessage } from '@whiskeysockets/baileys'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

import { client, ephemeral } from '../bot'
import { SDSettings, stickerMeta } from '../config'
import { clone } from './utils'

export const react = async (message: WAMessage, emoji: string) => {
  const jid = message.key.remoteJid || ''
  const reaction = { react: { text: emoji,
    key: message.key } }
  await client.sendMessage(jid, reaction)
}

export const deleteMessage = async (message: WAMessage) => {
  const jid = message.key.remoteJid || ''
  await client.sendMessage(jid, { delete: message.key })
}

export const makeSticker = async (message: WAMessage, url = '') => {
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
      const meta = clone(stickerMeta)
      meta.type = type
      const sticker = new Sticker(buffer, meta)

      client.sendMessage(jid, await sticker.toMessage(), ephemeral)
    }
  }
}

export const imagine = async (prompt: string) => {
  const lorasUrl = `${SDSettings.baseUrl}/sdapi/v1/loras`
  const txt2imgUrl = `${SDSettings.baseUrl}/sdapi/v1/txt2img`
  const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  })

  const loras: string[] = []
  const resLoras = <{name: string, alias: string}[]> await (await fetch(lorasUrl, { headers })).json()
  resLoras.forEach(lora => loras.push(`<lora:${lora.alias}:1>`))
  
  const payload = {
    prompt: `${prompt} ${SDSettings.addPrompt} ${loras.join(' ')}`,
    steps: SDSettings.steps,
    restore_faces: true,
    negative_prompt: SDSettings.negativePrompt,
    width: SDSettings.width,
    height: SDSettings.height,
    cfg_scale: SDSettings.cfg
  }
  const data = await (await fetch(txt2imgUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers
  })).json()
  return Buffer.from(<string>data.images[0], 'base64')
}
