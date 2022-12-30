import { GroupChatId, Message } from '@open-wa/wa-automate'
import _ from 'lodash'
import { waClient } from '..'

export let AdminGroups: GroupChatId[] = []

export class AdminGroupsManager {
  static add = (group: GroupChatId) => {
    AdminGroups.push(group)
    AdminGroups = _.sortedUniq(AdminGroups)
  }
  static remove = (group: GroupChatId) => {
    AdminGroups = _.remove(AdminGroups, group)
  }
  static refresh = async (message: Message) => {
    // return if not a Group Message
    if (!message.isGroupMsg) return
    const groupId = message.chat.groupMetadata.id
    try {
      const me = await waClient.getMe()
      const admins = await waClient.getGroupAdmins(groupId)

      if (admins.indexOf(me.status) >= 0) {
        // I am admin
        AdminGroupsManager.add(groupId)
      } else {
        // I am not admin
        AdminGroupsManager.remove(groupId)
      }
    } catch (e) {
      console.error(e)
    }
  }
}
