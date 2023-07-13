import { Boom } from '@hapi/boom'
import makeWASocket, {
  areJidsSameUser,
  DisconnectReason,
  downloadMediaMessage,
  isJidGroup,
  MiscMessageGenerationOptions,
  useMultiFileAuthState,
  WA_DEFAULT_EPHEMERAL
} from '@whiskeysockets/baileys'
import express from 'express'
import { pino } from 'pino'
import { imageSync } from 'qr-image'

import { botOptions } from './config'
import { handleAudio } from './handlers/audioHandler'
import { isUserBanned } from './handlers/dbHandler'
import { handleText } from './handlers/textHandler'
import { deleteMessage, makeSticker } from './utils/baileysHelper'

// create exportable WA Client
export let client: ReturnType<typeof makeWASocket>

// create express webserver
const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// create QR string holder
let qr: string | undefined

// Default ephemeral
export const ephemeral: MiscMessageGenerationOptions = {
  ephemeralExpiration: WA_DEFAULT_EPHEMERAL
}

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(`/data/${botOptions.sessionId}`)

  client = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' })
  })
  client.ev.on('connection.update', (state) => (qr = state.qr))
  client.ev.on('creds.update', saveCreds)
  client.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const isLogout =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut
      if (isLogout) {
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log('opened connection')
    }
  })

  // Receive and process messages
  client.ev.on('messages.upsert', async (event) => {
    for (const message of event.messages) {
      // This is where the fun begins!

      // Do nothing if self, if no message, no remoteJid, Broadcast, Reaction
      if (
        message.key.fromMe ||
        !message.message ||
        !message.key.remoteJid ||
        message.key.remoteJid === 'status@broadcast' ||
        message.message.reactionMessage
      )
        continue

      // Get the sender of the message
      const sender = message.key.participant
        ? message.key.participant
        : message.key.remoteJid
      // Is the sender the Bot owner?
      const isOwner = sender.split('@')[0] === botOptions.ownerNumber
      // Is this a Group?
      const isGroup = isJidGroup(message.key.remoteJid)
      // If so, get the group
      const group = isGroup
        ? await client.groupMetadata(message.key.remoteJid)
        : undefined
      // Is the sender an admin of the group?
      const isAdmin = group
        ? group.participants
          .find((p) => areJidsSameUser(p.id, sender))
          ?.admin?.endsWith('admin') !== null
        : false
      // Is the Bot an admin of the group?
      const amAdmin = group
        ? group.participants
          .find((p) => areJidsSameUser(p.id, client.user?.id))
          ?.admin?.endsWith('admin')
        : false
      // Is sender banned?
      const isBanned = await isUserBanned(sender.replace(/\D/g, ''))

      // Skips personal chats unless specified
      if (!isGroup) {
        if (botOptions.groupsOnly) {
          continue
        }
      } else {
        // Skips non-administered groups unless specified
        if (botOptions.groupAdminOnly && !amAdmin) {
          continue
        }
      }

      // Delete messages of banned users, except Owner
      if (!isOwner && isBanned) {
        await deleteMessage(message)
        continue
      }

      // Handle simple text message
      if (
        message.message.extendedTextMessage ||
        message.message.conversation ||
        message.message.ephemeralMessage
      ) {
        // Body of message is different whether it's individual or group
        const body =
          message.message.extendedTextMessage?.text ||
          message.message.conversation ||
          message.message.ephemeralMessage?.message?.extendedTextMessage
            ?.text ||
          message.message.ephemeralMessage?.message?.conversation ||
          ''
        if (body) {
          await handleText(message, body, group, isOwner, isAdmin)
          continue
        }
      }

      // Handle audio message
      if (message.message.audioMessage) {
        await handleAudio(message)
        continue
      }

      // Handle Image / GIF / Video message
      if (
        message.message.imageMessage ||
        message.message.videoMessage ||
        message.message.ephemeralMessage?.message?.imageMessage ||
        message.message.ephemeralMessage?.message?.videoMessage ||
        message.message.viewOnceMessage?.message?.imageMessage ||
        message.message.viewOnceMessage?.message?.videoMessage ||
        message.message.viewOnceMessageV2?.message?.imageMessage ||
        message.message.viewOnceMessageV2?.message?.videoMessage
      ) {
        await makeSticker(message)
        continue
      }

      // Handle sticker message
      if (message.message.stickerMessage) {
        const sticker = (await downloadMediaMessage(
          message,
          'buffer',
          {}
        )) as Buffer
        await client.sendMessage(
          message.key.remoteJid,
          { image: sticker },
          { quoted: message,
            ephemeralExpiration: WA_DEFAULT_EPHEMERAL }
        )
        continue
      }

      console.log('Message payload:')
      console.log(message)
    }
  })
}
// run in main file
connectToWhatsApp()
app.get('/qr', (_req, res) => {
  if (qr) res.end(imageSync(qr))
  else res.end(client.authState.creds.me?.id)
})
app.post('/api/webhook', (req, res) => {
  console.log(req.body)
  res.json({ status: 'ok',
    data: req.body })
})
app.listen(3000, () => console.log('Web Server Started'))
