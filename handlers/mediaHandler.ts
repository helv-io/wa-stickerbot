import { getConversionOptions, WhatsappMedia } from '../utils/mediaHandler'
import { Message, MessageTypes } from '@open-wa/wa-automate'
import { stickerMeta, circleMeta } from '../config'
import { addCount } from '../utils/dbHandler'
import mime from 'mime-types'
import { waClient } from '..'

export const handleMedia = async (message: Message) => {
  // Start typing
  await waClient.simulateTyping(message.from, true)

  const data = await waClient.decryptMedia(message)
  const media: WhatsappMedia = {
    dataURL: data,
    filename: `${message.t}.${mime.extension(message.mimetype || '') || ''}`,
    mediaData: Buffer.from(data)
  }

  if (message.type === MessageTypes.STICKER) {
    try {
      await waClient.sendImage(message.from, media.dataURL, media.filename, '')
    } catch {
      console.log('Sending Sticker as GIF Failed')
    }
  } else if (media.filename.endsWith('.mp4')) {
    // Sends as Video Sticker
    console.log('MP4/GIF Sticker', media.filename)
    addCount('Videos')

    for (let i = 15; i > 0; i--) {
      try {
        try {
          await waClient.sendMp4AsSticker(
            message.from,
            media.dataURL,
            getConversionOptions(i),
            stickerMeta
          )
        } catch {}

        try {
          await waClient.sendMp4AsSticker(
            message.from,
            media.dataURL,
            getConversionOptions(i),
            circleMeta
          )
        } catch {}
        break
      } catch {
        console.log(`Video is too long. Reducing length.`)
      }
    }
  } else if (media.filename.endsWith('.oga')) {
    try {
      await waClient.sendPtt(
        message.from,
        media.dataURL,
        'true_0000000000@c.us_JHB2HB23HJ4B234HJB'
      )
    } catch {}
  } else {
    // Sends as Image sticker
    console.log('IMAGE Sticker', media.filename)
    addCount('Images')

    try {
      await waClient.sendImageAsSticker(
        message.from,
        media.dataURL,
        stickerMeta
      )
    } catch {}
    try {
      await waClient.sendImageAsSticker(message.from, media.dataURL, circleMeta)
    } catch {}
  }
  return
}
