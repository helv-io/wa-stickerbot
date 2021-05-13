import { Client } from '@open-wa/wa-automate'
import qs from 'qs'

import { botOptions } from '../config'
import { getImgflipImage } from './imgflipHandler'

export const paramSerializer = (p: any) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const registerParticipantsListener = (client: Client) => {
  client.onGlobalParticipantsChanged(async (event) => {
    const groupId = event.chat as unknown as `${number}-${number}@g.us`

    switch (event.action) {
      case 'remove': {
        console.log('Removed', event.who)
        if (botOptions.interactOut) {
          client.sendImage(
            groupId,
            await getImgflipImage(botOptions.outMessage),
            '',
            `Adeus +${event.who.toString().split('@')[0]}, vai tarde!`
          )
        }
        break
      }

      case 'add': {
        console.log('Added', event.who)
        if (botOptions.interactOut) {
          client.sendImage(
            groupId,
            await getImgflipImage(botOptions.inMessage),
            '',
            `Divirta-se, +${event.who.toString().split('@')[0]}!`
          )
          const groupInfo = await client.getGroupInfo(groupId)
          client.sendText(groupId, groupInfo.description)
        }
        break
      }
    }
  })
}
