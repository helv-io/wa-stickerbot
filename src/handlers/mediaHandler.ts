import { Message } from 'whatsapp-web.js'

import { stickerMeta } from '../config'
import { addCount } from '../handlers/dbHandler'
import { transcribeAudio } from '../handlers/speechHandler'
import { chat } from '../index'
import { autoCrop } from '../utils/utils'

export const handleMedia = async (message: Message) => {
  // Start typing
  await (await message.getChat()).sendStateTyping()

  const media = await message.downloadMedia()
  console.log(media.mimetype)
  try {
    if (media.mimetype.startsWith('video')) {
      // Sends as Video Sticker
      console.log('MP4/GIF Sticker')
      addCount('Videos')
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
      // Sends as Image sticker
      console.log('IMAGE Sticker')
      addCount('Images')
      await chat.sendMessage(await autoCrop(media), stickerMeta)
    } else {
      console.log('Unrecognized media', media.mimetype)
    }
  } catch (error) {
    console.log(error)
  }
}
