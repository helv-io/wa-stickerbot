import {
  ConfigObject,
  Mp4StickerConversionProcessOptions,
  StickerMetadata
} from '@open-wa/wa-automate'
import { GiphySearch } from './types/Giphy'
import { Imgflip } from './types/Imgflip'
import { TenorSearch } from './types/Tenor'

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
  useChrome: true,
  sessionDataPath: '/data'
}

// Number of stickers when seraching for multiples
// Interact with Groups only
// Custom Instructions
export const botOptions = {
  donationLink: process.env.SB_DONATION || 'pix@helv.io',
  donationChance: +(process.env.SB_DONATION_MESSAGE_CHANCE || 30),
  stickers: +(process.env.SB_STICKERS || 10),
  groupAdminOnly: process.env.SB_GROUP_ADMIN_ONLY || true,
  groupsOnly: process.env.SB_GROUPS_ONLY || true,
  welcomeMessage: process.env.SB_WELCOME_MESSAGE
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

// https://imgflip.com/api
export const imgflip: Imgflip = {
  template_id: '',
  boxes: [],
  username: process.env.IMGFLIP_USERNAME || '',
  password: process.env.IMGFLIP_PASSWORD || ''
}
