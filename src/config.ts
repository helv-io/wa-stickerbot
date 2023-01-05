import dotenv from 'dotenv'
import { ClientOptions, LocalAuth, MessageSendOptions } from 'whatsapp-web.js'

import { GiphySearch } from './types/Giphy'
import { TenorSearch } from './types/Tenor'

// Load OS Env Vars
dotenv.config()

// https://docs.wwebjs.dev/global.html#StickerMetadata
export const stickerMeta: MessageSendOptions = {
  sendMediaAsSticker: true,
  stickerAuthor: process.env.SB_AUTHOR || 'Helvio',
  stickerName: process.env.SB_PACK || 'Sticker Bot'
}

// https://docs.wwebjs.dev/Client.html#info
export const clientConfig: ClientOptions = {
  authStrategy: new LocalAuth({
    clientId: process.env.WA_SESSION_ID,
    dataPath: '/data'
  }),
  ffmpegPath: '/usr/bin/ffmpeg',
  takeoverOnConflict: true,
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium'
  }
}

// Number of stickers when seraching for multiples
// Interact with Groups only
// Custom Instructions
export const botOptions = {
  donationLink: process.env.SB_DONATION || 'pix@helv.io',
  donationChance: +(process.env.SB_DONATION_MESSAGE_CHANCE || 30),
  stickers: +(process.env.SB_STICKERS || 10),
  groupAdminOnly: JSON.parse(process.env.SB_GROUP_ADMIN_ONLY || 'false'),
  groupsOnly: JSON.parse(process.env.SB_GROUPS_ONLY || 'false'),
  welcomeMessage: process.env.SB_WELCOME_MESSAGE,
  ownerNumber: process.env.SB_OWNER_NUMBER || '',
  azureKey: process.env.SPEECH_KEY || '',
  azureLanguage: process.env.SPEECH_LANGUAGE || 'pt-BR'
}

// https://developers.giphy.com/docs/api/endpoint#search
export const giphySearch: GiphySearch = {
  api_key: process.env.GIPHY_API || '',
  lang: process.env.GIPHY_LANGUAGE || 'pt',
  limit: 1,
  q: 'placeholder',
  type: 'gif'
}

// https://tenor.com/gifapi/documentation#endpoints-search
export const tenorSearch: TenorSearch = {
  key: process.env.TENOR_API || '',
  locale: process.env.TENOR_LOCALE || 'pt_BR',
  media_filter: 'minimal',
  limit: 1,
  q: 'placeholder',
  type: 'gif'
}
