import { getConversionOptions, WhatsappMedia } from '../utils/mediaHandler'
import { Message, MessageTypes } from '@open-wa/wa-automate'
import { stickerMeta, circleMeta } from '../config'
import { addCount } from '../utils/dbHandler'
import mime from 'mime-types'
import { waClient } from '..'
import fs from 'fs/promises'
import { spawn } from 'child_process'

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
    const origFile = `/data/orig_${media.filename}`
    const procFile = `/data/proc_${media.filename}`
    await fs.writeFile(origFile, media.mediaData)

    let ffmpeg = spawn('ffmpeg', [
      '-i',
      origFile,
      '-filter:a',
      'atempo=1.8',
      '-vn',
      procFile
    ])

    ffmpeg.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
    })

    ffmpeg.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`)
    })

    ffmpeg.on('error', (error) => {
      console.log(`error: ${error.message}`)
    })

    ffmpeg.on('close', async (code) => {
      console.log(`child process exited with code ${code}`)

      try {
        await waClient.sendPtt(
          message.from,
          procFile,
          'true_0000000000@c.us_JHB2HB23HJ4B234HJB'
        )
      } catch {
      } finally {
        // await fs.unlink(origFile)
        // await fs.unlink(procFile)
      }
    })
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
