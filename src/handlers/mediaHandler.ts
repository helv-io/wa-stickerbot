import { Message, MessageTypes } from '@open-wa/wa-automate'
import { stickerMeta, circleMeta, botOptions } from '../config'
import { addCount } from '../utils/dbHandler'
import mime from 'mime-types'
import { waClient } from '..'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { mp4StickerConversionOptions } from '../config'
import util from 'util'
import { transcribeAudio } from '../utils/speechHandler'
import { tmpdir } from 'os'
import path from 'path'

const run = util.promisify(exec)

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
  } else if (
    // Audio files
    media.filename.endsWith('.oga') ||
    media.filename.endsWith('.mpga')
  ) {
    // Extract base64 from Media and save to file
    const origFile = path.join(tmpdir(), media.filename)
    const waveFile = path.join(tmpdir(), `${media.filename}.wav`)
    const b64 = `${media.dataURL.split(';base64,').pop()}`
    await fs.writeFile(origFile, b64, { encoding: 'base64' })

    const convertToWav = [
      'ffmpeg',
      '-i',
      origFile,
      '-ac 1',
      '-af aresample=16000',
      '-y',
      waveFile
    ].join(' ')

    // Run and print outputs
    const wave = await run(convertToWav)
    console.log(wave.stdout)
    console.error(wave.stderr)

    // Send
    await transcribeAudio(waveFile, message)

    // Delete files
    await fs.unlink(origFile)
    await fs.unlink(waveFile)
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
