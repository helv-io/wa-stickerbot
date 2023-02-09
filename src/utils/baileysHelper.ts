import { downloadMediaMessage, WAMessage } from '@adiwajshing/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

import { client } from '../bot';
import { stickerMeta } from '../config';


export const react = async (message: WAMessage, emoji: string) => {
    message.key.remoteJid = message.key.remoteJid || ''
    const reaction = { react: { text: emoji, key: message.key } }
    await client.sendMessage(message.key.remoteJid, reaction)
}

export const deleteMessage = async (message: WAMessage) => {
    message.key.remoteJid = message.key.remoteJid || ''
    await client.sendMessage(message.key.remoteJid, { delete: message.key })
}

export const makeSticker = async (message: WAMessage) => {
    await react(message, '🤖')
    message.key.remoteJid = message.key.remoteJid || ''
    const buffer = <Buffer>await downloadMediaMessage(message, 'buffer', {})

    const types = [StickerTypes.DEFAULT, StickerTypes.CIRCLE]

    for (const type of types) {
        const sticker = new Sticker(buffer, {
            pack: stickerMeta.stickerName,
            author: stickerMeta.stickerAuthor,
            type
        })

        client.sendMessage(message.key.remoteJid, await sticker.toMessage())
    }
}

