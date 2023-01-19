import * as fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import gm from 'gm'
import { Chat, Message, MessageMedia } from 'whatsapp-web.js'

import { stickerMeta } from '../config'
import { addCount } from '../handlers/dbHandler'
import { transcribeAudio } from '../handlers/speechHandler'
import { roundImage } from '../utils/utils'

export const handleMedia = async (message: Message, chat: Chat) => {
  // Start typing
  await (await message.getChat()).sendStateTyping()

  const media = await message.downloadMedia()
  const contact = await message.getContact()
  media.filename = media.filename || `${message.id.id}.${media.mimetype.split('/')[1]}` || message.id.id

  // Log mimetype for statistics
  await addCount(media.mimetype)
  console.log(`${media.mimetype} (${contact.pushname})[${contact.number}]`)
  try {
    if (media.mimetype.startsWith('video')) {
      // Sends as Video Sticker
      await chat.sendMessage(media, stickerMeta)
      // Badge mode
      await chat.sendMessage(await roundImage(media), stickerMeta)
    } else if (media.mimetype.startsWith('audio')) {
      // Transcribe
      const transcription = await transcribeAudio(media)

      // Reply with transcription
      message.reply(transcription)
    } else if (media.mimetype.startsWith('image')) {
      if (!media.mimetype.endsWith('webp')) {
        // Image to Sticker
        await chat.sendMessage(media, stickerMeta)
        // Badge mode
        await chat.sendMessage(await roundImage(media), stickerMeta)
      }
      // Sticker to Image
      else {
        try {
          const mp4 = path.join(tmpdir(), `${message.id.id}.mp4`)
          const webp = Buffer.from(media.data, 'base64')
          const im = gm.subClass({ imageMagick: true })
          im(webp).write(mp4, async () => {
            await chat.sendMessage(MessageMedia.fromFilePath(mp4))
            await fs.unlink(mp4)
          })
        } catch (error) {
          console.error(error)
        }
      }
    } else {
      console.info(`Unknown Media Type: ${media.mimetype}`)
    }
  } catch (error) {
    console.log('MediaHandler error')
    console.error(error)
  }
}
