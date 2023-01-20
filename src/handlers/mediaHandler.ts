
import { Chat, Message, MessageMedia } from 'whatsapp-web.js'

import { stickerMeta } from '../config'
import { addCount } from '../handlers/dbHandler'
import { transcribeAudio } from '../handlers/speechHandler'
import { badge, stickerToGif } from '../utils/utils'

export const handleMedia = async (message: Message, chat: Chat) => {
  // Start typing
  await (await message.getChat()).sendStateTyping()

  const media = await message.downloadMedia()
  const contact = await message.getContact()

  // Use original filename if one exists, otherwise create one using id as base and the second part
  // of the mime (after /) for the extension. Sometimes mime can contain extra data after a ; like
  // 'audio/ogg; codecs=opus', so we'll use the first part instead, which would be 'ogg'.
  // If somehow that fails, default to the id with no extension.
  media.filename = media.filename || `${message.id.id}.${media.mimetype?.split('/')[1]?.split(';')[0]}` || message.id.id

  // Log mimetype for statistics
  await addCount(media.mimetype)
  console.log(`${media.mimetype} (${contact.pushname})[${contact.number}]`)
  try {
    if (media.mimetype.startsWith('video')) {
      // Sends as Video Sticker
      await chat.sendMessage(media, stickerMeta)
      // Badge mode
      await chat.sendMessage(await badge(media), stickerMeta)
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
        console.log(await chat.sendMessage(await badge(media), stickerMeta))
        // From File
        const mediaFromFile = MessageMedia.fromFilePath('/data/animated.webp')
        console.log(await chat.sendMessage(mediaFromFile, stickerMeta))
        // debug?!
        console.log(media)
        console.log(mediaFromFile)
      }
      // Sticker to Image
      else {
        await chat.sendMessage(await stickerToGif(media))
      }
    } else {
      console.info(`Unknown Media Type: ${media.mimetype}`)
    }
  } catch (error) {
    console.log('MediaHandler error')
    console.error(error)
  }
}
