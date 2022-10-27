import { Message, MessageTypes } from '@open-wa/wa-automate'
import { stickerMeta, circleMeta } from '../config'
import { addCount } from '../utils/dbHandler'
import mime from 'mime-types'
import { waClient } from '..'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { mp4StickerConversionOptions } from '../config'
import util from 'util'

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
  } else if (media.filename.endsWith('.oga')) {
    const origFile = `/data/orig_${media.filename}`
    const procFile = `/data/proc_${media.filename}.mp3`
    const waveFile = `/data/proc_${media.filename}.wav`
    const b64 = `${media.dataURL.split(';base64,').pop()}`
    await fs.writeFile(origFile, b64, { encoding: 'base64' })

    // Something between 20 and 80
    const pitch = Math.round(Math.random() * 60 + 20)
    // Something between 0.5 and 3
    const tempo = Math.round(10 * (Math.random() + 0.5)) / 10
    // Reverse?
    const reverse = Math.random() < 0.25

    const ffmpeg_filters = [
      'ffmpeg',
      '-i',
      origFile,
      '-filter:a',
      `atempo=${tempo},asetrate=r=${pitch}K${reverse ? ',areverse' : ''}`,
      '-vn',
      '-y',
      procFile
    ]

    const ffmpeg_wave = [
      'ffmpeg',
      '-i',
      origFile,
      '-ac 1',
      '-af aresample=16000',
      '-y',
      waveFile
    ]

    const stt_cmd = [
      'voice2json',
      '--profile pt-br_pocketsphinx-cmu',
      'transcribe-wav',
      waveFile,
      '2>/dev/null'
    ]

    // Run and print outputs
    const rand = await run(ffmpeg_filters.join(' '))
    console.log(rand.stdout)
    console.error(rand.stderr)

    const wave = await run(ffmpeg_wave.join(' '))
    console.log(wave.stdout)
    console.error(wave.stderr)

    const stt = await (await run(stt_cmd.join(' '))).stdout
    console.log(stt)

    try {
      await waClient.sendPtt(
        message.from,
        procFile,
        'true_0000000000@c.us_JHB2HB23HJ4B234HJB'
      )
      await waClient.sendReplyWithMentions(
        message.from,
        JSON.parse(stt).text,
        message.id
      )
    } catch {
    } finally {
      await fs.unlink(origFile)
      await fs.unlink(procFile)
      await fs.unlink(waveFile)
    }
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
