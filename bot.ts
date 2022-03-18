#!/usr/bin/env ts-node

import { create, MessageType } from '@wppconnect-team/wppconnect';
import axios from 'axios';
import { botOptions } from './config';
import { addCount, getCount } from './utils/dbHandler';
import { getGiphys } from './utils/giphyHandler';
import { getImgflipList, getImgflipImage } from './utils/imgflipHandler';
import { getStickerSearches } from './utils/stickerHandler';
import { getTenors } from './utils/tenorHandler';
import { getTextAction, actions } from './utils/textHandler';
import mime from 'mime-types'
import { WhatsappMedia } from './utils/mediaHandler';
import { tmpdir } from 'os';
import * as fs from 'fs/promises';

const session = 'wa-stickerbot'

const start = async () => {
    const client = await create({
        session: session,
        puppeteerOptions: {
            userDataDir: `./tokens/${session}`
        },
        browserArgs: ['--no-sandbox']
    })

    let adminGroups: string[] = []

    client.onMessage(async message => {
        // Get groupId
        let groupId = message.isGroupMsg ? message.chatId : ''

        // Adjust adminGroups (Groups I am Admin)
        if (groupId) {
            const me = await client.getWid()
            const admins = (await client.getGroupAdmins(groupId)).map(w => w._serialized)

            if (admins.indexOf(me) >= 0) {
                adminGroups.push(groupId)
                // Remove duplicates
                adminGroups = adminGroups.filter(
                    (value, index, self) => self.indexOf(value) === index
                )
            } else {
                adminGroups = adminGroups.filter((v) => v !== groupId)
            }
        }

        // Skips non-administered groups unless specified
        if (message.isGroupMsg) {
            if (botOptions.groupAdminOnly) {
                if (!adminGroups.includes(groupId)) {
                    return
                }
            }
        } else {
            if (botOptions.groupsOnly) {
                return
            }
        }

        console.log('Message type: ', message.type)

        // Start typing
        await client.startTyping(message.from)

        switch (message.type) {
            case MessageType.CHAT:
                // Handles Text Messages
                const action = await getTextAction(message.body)
                if (action) {

                    switch (action) {
                        case actions.INSTRUCTIONS:
                            console.log('Sending instructions')

                            if (groupId) {
                                const link = await client.getGroupInviteLink(message.from)
                                let groupDesc = ''
                                try {
                                    groupDesc = (await client.getGroupInfoFromInviteLink(link)).desc
                                } catch {
                                    groupDesc = 'No Group Description'
                                }
                                await client.sendText(message.from, groupDesc)
                            } else {
                                await client.sendText(message.from, 'No Group Instructions.')
                            }
                            break

                        case actions.LINK:
                            if (!groupId) return
                            console.log('Sending Link')

                            await client.sendText(
                                message.from,
                                await client.getGroupInviteLink(message.from)
                            )
                            break

                        case actions.MEME_LIST:
                            console.log('Sending meme list')

                            await client.sendText(message.from, await getImgflipList())
                            break

                        case actions.STATS:
                            // Build stats text
                            let stats = `*Current Usage*\n\n`

                            stats += `Images\n`
                            stats += `${await getCount('Images')}\n\n`

                            stats += `GIFs and Videos\n`
                            stats += `${await getCount('Videos')}\n\n`

                            stats += `Memes\n`
                            stats += `${await getCount('Memes')}\n\n`

                            stats += `Stickers\n`
                            stats += `${await getCount('Stickers')}\n\n`

                            stats += `Text\n`
                            stats += `${await getCount('Text')}`

                            await client.sendText(message.from, stats)
                            break

                        case actions.MEME:
                            console.log(`Sending (${message.body.split('\n').join(')(')})`)
                            addCount('Memes')

                            const url = await getImgflipImage(message.body)
                            await client.sendImage(message.from, url, undefined, url, message.id)
                            await client.sendImageAsSticker(message.from, url)
                            break

                        case actions.TEXT:
                            const text = message.body.slice(6)
                            const textUrlA = `https://api.xteam.xyz/attp?text=${encodeURIComponent(
                                text
                            )}`
                            const textUrlS = `https://api.xteam.xyz/ttp?text=${encodeURIComponent(
                                text
                            )}`
                            console.log(`Sending (${text})`)
                            addCount('Text')

                            const b64a = await axios.get(textUrlA)
                            const b64s = await axios.get(textUrlS)


                            if (b64a.status === 200)
                                await client.sendImageAsStickerGif(
                                    message.from,
                                    b64a.data.result
                                )

                            if (b64s.status === 200) {
                                console.log(message.from)
                                const res = await client.sendImageAsSticker(
                                    message.chatId,
                                    b64s.data.result
                                )
                                console.log(res)
                            }

                            break

                        case actions.STICKER:
                            const searches = getStickerSearches(message.body)

                            console.log('Sending Stickers for', searches.giphySearch.q)

                            const giphyURLs = await getGiphys(searches.giphySearch)
                            const tenorURLs = await getTenors(searches.tenorSearch)

                            if (giphyURLs) {
                                await client.sendImage(
                                    message.from,
                                    'attributions/giphy.gif'
                                )
                            }
                            if (tenorURLs) {
                                await client.sendImage(
                                    message.from,
                                    'attributions/tenor.png'
                                )
                            }

                            giphyURLs.concat(tenorURLs).forEach(async (url) => {
                                await client.sendImage(
                                    message.from,
                                    url
                                )
                                addCount('Stickers')
                            })
                            break
                    }
                }
                break;
            case MessageType.STICKER:
                let sticker64 = await client.downloadMedia(message)
                await client.sendImageAsSticker(message.from, sticker64)
                break;

            case MessageType.IMAGE:
                let mediaData = await client.decryptFile(message)
                const media: WhatsappMedia = {
                    filename: `${message.t}.${mime.extension(message.mimetype || '') || ''}`,
                    mediaData: mediaData,
                    dataURL: `data:${message.mimetype || ''};base64,${mediaData.toString(
                        'base64'
                    )}`
                }

                await client.sendImageAsSticker(message.from, media.dataURL)
                break;
        }

        await client.stopTyping(message.from)
    })
}

start()