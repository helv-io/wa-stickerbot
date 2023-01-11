import * as fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import gm from 'gm'
import { Chat, Message, MessageMedia } from 'whatsapp-web.js'

import { stickerMeta } from '../config'
import { addCount } from '../handlers/dbHandler'
import { transcribeAudio } from '../handlers/speechHandler'
import { autoCrop } from '../utils/utils'

export const handleMedia = async (message: Message, chat: Chat) => {
  // Start typing
  await (await message.getChat()).sendStateTyping()

  const media = await message.downloadMedia()
  const contact = await message.getContact()

  // Log mimetype for statistics
  await addCount(media.mimetype)
  console.log(`${media.mimetype} (${contact.pushname})[${contact.number}]`)
  try {
    if (media.mimetype.startsWith('video')) {
      // Sends as Video Sticker
      await chat.sendMessage(media, stickerMeta)
    } else if (media.mimetype.startsWith('audio')) {
      // Audio File
      // Extract base64 from Media and save to file
      media.filename = message.id.id

      // Transcribe
      const transcription = await transcribeAudio(media)

      // Reply with transcription
      message.reply(transcription)
    } else if (
      media.mimetype.startsWith('image') &&
      !media.mimetype.endsWith('webp')
    ) {
      // Sends as Image (autocropped) sticker
      await chat.sendMessage(await autoCrop(media), stickerMeta)
    } else {
      try {
        // Probably a sticker, send back as GIF
        const gif = path.join(tmpdir(), `${message.id.id}.gif`)
        const webp = Buffer.from(media.data, 'base64')
        const im = gm.subClass({ imageMagick: true })
        im(webp).write(gif, async () => {
          await chat.sendMessage(MessageMedia.fromFilePath(gif))
          await fs.unlink(gif)
        })
      } catch (error) {
        console.error(error)
      }
    }
  } catch (error) {
    console.log('MediHandler error')
    console.error(error)
  }
}
