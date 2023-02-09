import makeWASocket, {
  areJidsSameUser,
  DisconnectReason,
  isJidGroup,
  useMultiFileAuthState
} from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { pino } from 'pino'

import { addCount, isUserBanned } from './handlers/dbHandler'
import baileysClient from './utils/baileysClient'
import { botOptions, sessionId } from './config'
import { deleteMessage, makeSticker } from './utils/baileysHelper'
import { handleText } from './handlers/textHandler'

export let client: baileysClient

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(`/data/${sessionId}`)
  client = <baileysClient>makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' })
  })
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

      // Do nothing if self, if no message or no remote JID
      if (message.key.fromMe || !message.message || !message.key.remoteJid)
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

      // Detect Message Type and increase counter
      const messageType = Object.keys(message.message)[0]
      console.log(messageType)
      addCount(messageType)

      // Handle simple text message
      if (
        messageType === 'conversation' ||
        messageType === 'extendedTextMessage'
      ) {
        // Body of message is different whether it's individual or group
        const body =
          message.message.extendedTextMessage?.text ||
          message.message.conversation ||
          ''
        if (body) await handleText(message, body, group, isOwner, isAdmin)
      }

      if (messageType === 'imageMessage' || messageType === 'videoMessage')
        await makeSticker(message)

      console.log('Message payload:')
      console.log(message)
    }
  })
}
// run in main file
connectToWhatsApp()
