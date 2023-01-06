import { Message } from 'whatsapp-web.js'

import { stickerMeta } from '../config'
import { addCount } from '../handlers/dbHandler'
import { transcribeAudio } from '../handlers/speechHandler'
import { autoCrop } from '../utils/utils'

export const handleMedia = async (message: Message, isAdmin: boolean) => {
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
      await message.reply(media, undefined, stickerMeta)
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
      await message.reply(await autoCrop(media), undefined, stickerMeta)
    } else {
      console.log('Unrecognized media', media.mimetype)
      // Probably a sticker, send back as GIF
      if (isAdmin) {
        await message.reply(media, undefined, { sendVideoAsGif: true })
        await message.reply(media, undefined, {})
      }
    }
  } catch (error) {
    console.log('MediHandler error')
    console.error(error)
  }
}
