/* eslint-disable import/no-unresolved */

import { ChatId, Client, create, GroupChatId } from '@open-wa/wa-automate';
import {
  Message,
  MessageTypes
} from '@open-wa/wa-automate/dist/api/model/message';
import express from 'express';

import { botOptions, clientConfig } from './config';
import { getDonors, isBanned } from './handlers/dbHandler';
import { handleMedia } from './handlers/mediaHandler';
import { handleText } from './handlers/textHandler';
import { handleWelcome } from './handlers/welcomeHandler';
import { AdminGroups, AdminGroupsManager } from './utils/adminGroups';
import { oneChanceIn } from './utils/utils';

export let waClient: Client
export let isAdmin: boolean, isOwner: boolean
export let groupId: GroupChatId | null

console.log('Environment Variables:')
console.log(process.env)

const start = async () => {
  // Welcome Message
  if (botOptions.welcomeMessage) {
    handleWelcome()
  }

  // Message Handlers
  void waClient.onMessage(async (message: Message) => {
    // Get groupId
    groupId = message.isGroupMsg ? message.chat.groupMetadata.id : null

    // Test if the sender is an owner or admin
    isOwner = message.sender.id.split('@')[0] === botOptions.ownerNumber
    isAdmin = groupId
      ? (await waClient.getGroupAdmins(groupId)).indexOf(message.sender.id) !==
      -1
      : false

    // Refresh adminGroups
    if (groupId) {
      await AdminGroupsManager.refresh(message)
    }

    // Skips personal chats unless specified
    if (!groupId) {
      if (botOptions.groupsOnly) {
        return
      }
    } else {
      // Skips non-administered groups unless specified
      if (botOptions.groupAdminOnly) {
        if (!AdminGroups.includes(groupId)) {
          return
        }
      }
    }

    // Delete messages of banned users, except Owner
    if (!isOwner && (await isBanned(message.sender.id.replace(/\D/g, '')))) {
      await waClient.deleteMessage(message.chatId, message.id)
      return
    }

    // Handle Media
    if (
      message.type === MessageTypes.IMAGE ||
      message.type === MessageTypes.VIDEO ||
      message.type === MessageTypes.AUDIO ||
      message.type === MessageTypes.VOICE ||
      message.type === MessageTypes.STICKER
    ) {
      handleMedia(message)
    }

    // Handle Text
    await handleText(message, groupId)

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
      await waClient.sendText(message.from, msg)
    }

    // Stop typing
    await waClient.simulateTyping(message.from, false)
  })

  // Click "Use Here" when another WhatsApp Web page is open
  void waClient.onStateChanged((state) => {
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      void waClient.forceRefocus()
    }
  })
}

create(clientConfig).then(async (client) => {
  // WhatsApp Client
  waClient = client
  await start()

  // Web Server
  const server = express()

  // Clean (not delete) all chats
  server.get('/clean', async (_req, res) => {
    res.send(await waClient.clearAllChats()).end()
  })

  // Clear (delete) all chats (except Group chats)
  server.get('/clear', async (_req, res) => {
    console.log('Deleting chats...')
    const chats = await (await waClient.getAllChats()).filter(c => !c.isGroup)
    await Promise.all(chats.map(async chat => {
      await waClient.deleteChat(chat.id)
    }))
    console.log(`${chats.length} chats deleted.`)
    res.end(`${chats.length} chats deleted.`)
  })

  // Get all groups
  server.get('/groups', async (_req, res) => {
    res.json(await waClient.getAllGroups()).end()
  })

  // Get all Chats
  server.get('/chats', async (_req, res) => {
    res.json(await waClient.getAllChats()).end()
  })

  // Get all Contacts
  server.get('/contacts', async (_req, res) => {
    res.json(await waClient.getAllContacts()).end()
  })

  // Get Screenshot
  server.get('/screenshot', async (_req, res) => {
    res.contentType('image/png')
    res.end(await waClient.getSnapshot()).end()
  })

  // Get Screenshot
  server.get('/screenshot/:chat', async (req, res) => {
    const chat = <ChatId>req.params.chat
    res.contentType('image/png')
    res.end(await waClient.getSnapshot(chat)).end()
  })

  // Get Client info
  server.get('/client', async (_req, res) => {
    res.json(await waClient).end()
  })

  await server.listen(3000, () => {
    console.log('Web Server Started.')
  })
})
