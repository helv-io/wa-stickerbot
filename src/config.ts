import dotenv from 'dotenv'

import { GiphySearch } from './types/Giphy'
import { TenorSearch } from './types/Tenor'

// Load OS Env Vars
dotenv.config()

// TODO: REMOVE
// https://docs.wwebjs.dev/global.html#StickerMetadata
export const stickerMeta = {
  sendMediaAsSticker: true,
  stickerAuthor: process.env.SB_AUTHOR || 'Helvio',
  stickerName: process.env.SB_PACK || 'Sticker Bot'
}

export const sessionId = process.env.WA_SESSION_ID || 'wa-stickerbot'

// Number of stickers when seraching for multiples
// Interact with Groups only
// Custom Instructions
export const botOptions = {
  donationLink: process.env.SB_DONATION || 'pix@helv.io',
  donationChance: +(process.env.SB_DONATION_MESSAGE_CHANCE || 30),
  enabledLanguages: process.env.ENABLED_LANGUAGES?.replaceAll(' ', '').split(
    ','
  ) || ['en-US', 'pt-BR'],
  stickers: +(process.env.SB_STICKERS || 10),
  groupAdminOnly: JSON.parse(process.env.SB_GROUP_ADMIN_ONLY || 'false'),
  groupsOnly: JSON.parse(process.env.SB_GROUPS_ONLY || 'false'),
  welcomeMessage: process.env.SB_WELCOME_MESSAGE,
  ownerNumber: process.env.SB_OWNER_NUMBER || '',
  azureSpeechRegion: process.env.SPEECH_REGION || 'eastus',
  azureSpeechKey: process.env.SPEECH_KEY || '',
  azureTextEndpoint:
    process.env.TEXT_ENDPOINT ||
    'https://text-analisys.cognitiveservices.azure.com/',
  azureTextKey: process.env.TEXT_KEY || ''
}

// https://developers.giphy.com/docs/api/endpoint#search
export const giphySearch: GiphySearch = {
  api_key: process.env.GIPHY_API || '',
  lang: process.env.GIPHY_LANGUAGE || 'pt',
  limit: 1,
  q: 'placeholder',
  type: 'gif'
}

// https://developers.google.com/tenor/guides/endpoints
export const tenorSearch: TenorSearch = {
  key: process.env.TENOR_API || '',
  client_key: process.env.WA_SESSION_ID,
  locale: process.env.TENOR_LOCALE || 'pt_BR',
  media_filter: 'webp_transparent',
  searchfilter: 'sticker,-static',
  limit: 1,
  q: 'placeholder'
}
