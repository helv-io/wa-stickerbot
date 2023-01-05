import { exec } from 'child_process'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import util from 'util'

import { Message } from 'whatsapp-web.js'

import { stickerMeta } from '../config'
import { addCount } from '../handlers/dbHandler'
import { transcribeAudio } from '../handlers/speechHandler'
import { chat } from '../index'
import { autoCrop } from '../utils/utils'

const run = util.promisify(exec)

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
      const origFile = path.join(tmpdir(), `${message.id.id}.ogg`)
      const waveFile = path.join(tmpdir(), `${message.id.id}.wav`)
      const b64 = media.data
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
    } else if (
      media.mimetype.startsWith('image') &&
      !media.mimetype.endsWith('webp')
    ) {
      // Sends as Image sticker
      console.log('IMAGE Sticker')
      addCount('Images')
      await chat.sendMessage(media, stickerMeta)
      console.log('Cropping', media.mimetype)
      await chat.sendMessage(await autoCrop(media), stickerMeta)
    } else {
      console.log('Unrecognized media', media.mimetype)
    }
  } catch (error) {
    console.log(error)
  }
}
