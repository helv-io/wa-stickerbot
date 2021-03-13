import { decryptMedia, Message } from '@open-wa/wa-automate'
import mime from 'mime-types'
import { mp4StickerConversionOptions } from '../config'

export const getMedia = async (message: Message) => {
  const mediaData = await decryptMedia(message)
  const media: WhatsappMedia = {
    filename: `${message.t}.${mime.extension(message.mimetype || '') || ''}`,
    mediaData: mediaData,
    dataURL: `data:${message.mimetype || ''};base64,${mediaData.toString(
      'base64'
    )}`
  }

  return media
}

export const getConversionOptions = (duration: number) => {
  const cOptions = mp4StickerConversionOptions
  cOptions.endTime = `00:00:${duration.toString().padStart(2, '0')}.0`
  return cOptions
}

export interface WhatsappMedia {
  filename: string
  mediaData: Buffer
  dataURL: string
}
