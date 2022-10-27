#!/usr/bin/env ts-node

import { create, Client } from '@open-wa/wa-automate'

import {
  Message,
  MessageTypes
} from '@open-wa/wa-automate/dist/api/model/message'
import { AdminGroups, AdminGroupsManager } from './handlers/adminGroups'
import { handleWelcome } from './handlers/welcomeHandler'
import { getDonors, isBanned } from './utils/dbHandler'
import { handleMedia } from './handlers/mediaHandler'
import { handleText } from './handlers/textHandler'
import { botOptions, clientConfig } from './config'
import { oneChanceIn } from './utils/utils'

export let waClient: Client

console.log('Environment Variables:')
console.log(process.env)

const start = async () => {
  // Welcome Message
  if (botOptions.welcomeMessage) {
    handleWelcome()
  }

  // Message Handlers
  void waClient.onMessage(async (message: Message) => {
    // Test if the sender is an owner
    const isOwner = message.sender.id.split('@')[0] === botOptions.ownerNumber

    // Get groupId
    const groupId = message.isGroupMsg ? message.chat.groupMetadata.id : null

    // Refresh adminGroups
    if (groupId) {
      AdminGroupsManager.refresh(message)
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
    await handleText(message, groupId, isOwner)

    // One chance in X to send a Donation link
    if (botOptions.donationLink && oneChanceIn(botOptions.donationChance)) {
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

create(clientConfig).then((client) => {
  waClient = client
  start()
})
