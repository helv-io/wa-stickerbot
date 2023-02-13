import {
  WAMessage,
  downloadMediaMessage,
  WA_DEFAULT_EPHEMERAL
} from '@adiwajshing/baileys'

import { client } from '../bot'

import { addCount } from './dbHandler'
import { transcribeAudio } from './speechHandler'

export const handleAudio = async (message: WAMessage) => {
  const jid = message.key.remoteJid || ''

  const media = (await downloadMediaMessage(message, 'buffer', {})) as Buffer
  const mimetype = message.message?.audioMessage?.mimetype || ''

  // Use id as base and the second part of the mime (after /) for the extension.
  // Sometimes mime can contain extra data after a ; like 'audio/ogg; codecs=opus',
  // so we'll use the first part instead, which would be 'ogg'.
  const filename = `${message.key.id}.${mimetype.split('/')[1]?.split(';')[0]}`

  // Log mimetype for statistics
  await addCount(mimetype)
  console.log(`${mimetype} (${message.pushName})[${message.key.participant}]`)
  try {
    // Transcribe
    const transcription = await transcribeAudio(
      filename,
      media.toString('base64')
    )
    // Reply with transcription
    client.sendMessage(
      jid,
      { text: transcription },
      { quoted: message, ephemeralExpiration: WA_DEFAULT_EPHEMERAL }
    )
  } catch (error) {
    console.error(`Error transcribing message: ${error}`)
  }
}
