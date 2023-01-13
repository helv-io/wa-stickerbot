import express from 'express'
import * as QRCode from 'qrcode'
import * as qrcodeTerm from 'qrcode-terminal'
import { Client, ContactId, GroupChat, Message } from 'whatsapp-web.js'

import { botOptions, clientConfig } from './config'
import { addCount, getDonors, isUserBanned } from './handlers/dbHandler'
import { handleMedia } from './handlers/mediaHandler'
import { handleText } from './handlers/textHandler'
import { oneChanceIn } from './utils/utils'

export const waClient: Client = new Client(clientConfig)
export let me: ContactId

let authQr = ''
let ready = false

const start = async () => {
  // Message Handlers
  void waClient.on('message', async (message: Message) => {
    // Do not act on self messages
    if (message.fromMe) return

    // Log message type
    addCount(message.type)

    // Define scoped variables
    const chat = await message.getChat()
    const group = chat.isGroup ? <GroupChat>chat : undefined
    const sender = (await message.getContact()).id.user
    const isOwner = sender === botOptions.ownerNumber // Is the sender the Owner of the Bot?
    const isAdmin = group
      ? !!group.participants.find(
        (p) => p.isAdmin && p.id.user === sender // Is the sender an Admin of the group?
      )
      : false
    const amAdmin = group
      ? group.participants.filter((p) => p.id.user === me.user)[0].isAdmin
      : false // Am I an Admin of the group?
    const isBanned = await isUserBanned(sender.replace(/\D/g, ''))

    // Skips personal chats unless specified
    if (!group) {
      if (botOptions.groupsOnly) {
        return
      }
    } else {
      // Skips non-administered groups unless specified
      if (botOptions.groupAdminOnly && !amAdmin) {
        return
      }
    }

    // Delete messages of banned users, except Owner
    if (!isOwner && isBanned) {
      await message.delete(true)
      return
    }

    // Handle Media
    if (message.hasMedia) {
      await message.react('🤖')
      handleMedia(message, chat)
    } else {
      // Handle Text
      await handleText(message, chat, group, isOwner, isAdmin)
    }

    // One chance in X to send a Donation link (except if Admin or Owner)
    if (
      botOptions.donationLink &&
      oneChanceIn(botOptions.donationChance) &&
      !isOwner &&
      !isAdmin
    ) {
      const donors = await getDonors()
      let msg = botOptions.donationLink
      if (donors) msg += `\n\n${await getDonors()}`
      await chat.sendMessage(msg)
    }

    // Stop typing
    await chat.clearState()
  })
}

// Web Server
const server = express()

// Clean (not delete) all chats
server.get('/clean', async (_req, res) => {
  if (!ready) return
  console.log('Deleting messages...')
  const chats = await waClient.getChats()
  await Promise.all(
    chats.map(async (chat) => {
      await chat.clearMessages()
    })
  )
  const result = `${chats.length} chats cleared.`
  console.log(result)
  res.end(result)
})

// Clear (delete) all chats (except Group chats)
server.get('/clear', async (_req, res) => {
  if (!ready) return
  console.log('Deleting chats...')
  const chats = await (await waClient.getChats()).filter((c) => !c.isGroup)
  await Promise.all(
    chats.map(async (chat) => {
      await chat.delete()
    })
  )
  console.log(`${chats.length} chats deleted.`)
  res.end(`${chats.length} chats deleted.`)
})

// Get all groups
server.get('/groups', async (_req, res) => {
  if (!ready) return
  const chats = (await waClient.getChats()).filter((c) => c.isGroup)
  res.json(chats).end()
})

// Get all Chats
server.get('/chats', async (_req, res) => {
  if (!ready) return
  res.json(await waClient.getChats()).end()
})

// Get QR
server.get('/qr', async (_req, res) => {
  if (ready || !authQr) {
    res.end(waClient.info.wid.user)
    return
  }
  const x = await (await QRCode.toDataURL(authQr)).split(';base64,').pop()
  res.type('png')
  res.end(Buffer.from(x || '', 'base64'))
})

// waClient listeners
waClient.on('ready', async () => await start())
waClient.on('qr', (qr) => {
  authQr = qr
  qrcodeTerm.generate(qr, { small: true })
})
waClient.on('ready', () => {
  ready = true
  authQr = ''
  console.log('Client is ready!')
  me = waClient.info.wid
})

// Start Server and Client
server.listen(3000, () => console.log('Web Server Started.'))
waClient.initialize()
