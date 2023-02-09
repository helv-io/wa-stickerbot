import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'

import { baileysClient, makeSticker, react } from './utils/baileysHelper'

export let client: baileysClient

const connectToWhatsApp = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    client = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })
    client.ev.on('creds.update', saveCreds)
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            // 
            const isLogout = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            // reconnect if not logged out
            if (isLogout) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('opened connection')
        }
    })

    // Receive and process messages
    client.ev.on('messages.upsert', async event => {
        console.log(JSON.stringify(event, undefined, 2))
        for (const message of event.messages) {
            if (message.key.fromMe || !message.message || !message.key.remoteJid) return
            const messageType = Object.keys(message.message)[0]
            console.log(messageType)
            if (messageType === 'imageMessage' || messageType === 'videoMessage') await makeSticker(message)
            await react(message, '🤖')
        }
    })
}
// run in main file
connectToWhatsApp()