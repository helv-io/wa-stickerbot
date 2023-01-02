import { GroupChatId } from '@open-wa/wa-automate'

import { waClient } from '..'
import { botOptions } from '../config'
import { AdminGroups } from '../utils/adminGroups'

export const handleWelcome = async () => {
  await waClient.onGlobalParticipantsChanged(async (event) => {
    // Create GroupID
    const groupId: GroupChatId = <GroupChatId>event.chat

    // Only interact if it's an add and the admin check passes
    if (
      event.action === 'add' &&
      (AdminGroups.includes(groupId) || !botOptions.groupsOnly)
    ) {
      const who = `${event.who.toString().split('@')[0]}:`
      await waClient.sendTextWithMentions(
        event.chat,
        `@${who}\n${botOptions.welcomeMessage}`
      )
    }
  })
}
