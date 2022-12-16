import {
  ConfigObject,
  Mp4StickerConversionProcessOptions,
  StickerMetadata
} from '@open-wa/wa-automate'
import { GiphySearch } from './types/Giphy'
import { TenorSearch } from './types/Tenor'

// Load OS Env Vars
import dotenv from 'dotenv'
dotenv.config()

// Begin changes here

// https://docs.openwa.dev/modules/api_model_media.html#stickermetadata
export const stickerMeta: StickerMetadata = {
  author: process.env.SB_AUTHOR || 'Helvio',
  pack: process.env.SB_PACK || 'Sticker Bot',
  keepScale: true
}

export const circleMeta: StickerMetadata = {
  author: process.env.SB_AUTHOR || 'Helvio',
  pack: process.env.SB_PACK || 'Sticker Bot',
  keepScale: true,
  circle: true
}

// https://docs.openwa.dev/interfaces/api_model.configobject.html
export const clientConfig: ConfigObject = {
  sessionId: process.env.WA_SESSION_ID,
  popup: process.env.WA_POPUP ? +process.env.WA_POPUP : 13579,
  multiDevice: true,
  // useChrome: true,
  sessionDataPath: '/data'
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

// https://docs.openwa.dev/modules/api_model_media.html#mp4stickerconversionprocessoptions
export const mp4StickerConversionOptions: Mp4StickerConversionProcessOptions = {
  crop: true,
  fps: 10,
  loop: 0,
  log: true,
  startTime: '00:00:00.0',
  endTime: '00:00:15.0'
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
