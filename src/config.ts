import dotenv from 'dotenv'
import { IStickerOptions } from 'wa-sticker-formatter/dist'

import { GiphySearch } from './types/Giphy'
import { TenorSearch } from './types/Tenor'

// Load OS Env Vars
dotenv.config()

// https://docs.wwebjs.dev/global.html#StickerMetadata
export const stickerMeta: IStickerOptions = {
  author: process.env.SB_AUTHOR || 'Helvio',
  pack: process.env.SB_PACK || 'Sticker Bot',
  quality: 80
}

// Number of stickers when seraching for multiples
// Interact with Groups only
// Custom Instructions
export const botOptions = {
  sessionId: process.env.WA_SESSION_ID || 'wa-stickerbot',
  donationLink: process.env.SB_DONATION || 'pix@helv.io',
  donationChance: +(process.env.SB_DONATION_MESSAGE_CHANCE || 30),
  stickers: +(process.env.SB_STICKERS || 10),
  groupAdminOnly: JSON.parse(process.env.SB_GROUP_ADMIN_ONLY || 'false'),
  groupsOnly: JSON.parse(process.env.SB_GROUPS_ONLY || 'false'),
  welcomeMessage: process.env.SB_WELCOME_MESSAGE,
  ownerNumber: process.env.SB_OWNER_NUMBER || ''
}

// Azure configuration
export const AzureConfig = {
  azureSpeechRegion: process.env.SPEECH_REGION || 'eastus',
  azureSpeechKey: process.env.SPEECH_KEY || '',
  azureTextEndpoint:
    process.env.TEXT_ENDPOINT ||
    'https://text-analisys.cognitiveservices.azure.com/',
  azureTextKey: process.env.TEXT_KEY || '',
  enabledLanguages: process.env.ENABLED_LANGUAGES?.replaceAll(' ', '').split(
    ','
  ) || ['pt-BR', 'en-US']
}

// Stable Diffusion settings
export const SDSettings = {
  baseUrl: process.env.SD_BASE_URL || '',
  steps: +(process.env.SD_STEPS || 20),
  width: +(process.env.SD_WIDTH || 512),
  height: +(process.env.SD_HEIGHT || 512),
  cfg: +(process.env.SD_CFG || 7),
  addPrompt: process.env.SD_ADD_PROMPT || [
    'high quality',
    'high resolution',
    'very detailed',
    '8k'
  ].join(', '),
  negativePrompt: process.env.SD_NEGATIVE_PROMPT || [
    'amputee',
    'autograph',
    'bad anatomy',
    'bad illustration ',
    'bad proportions',
    'beyond the borders',
    'blank background',
    'blurry',
    'body out of frame',
    'boring background',
    'branding',
    'cropped',
    'cut off',
    'deformed',
    'disfigured',
    'dismembered',
    'disproportioned',
    'distorted',
    'draft',
    'duplicate',
    'duplicated features',
    'extra arms',
    'extra fingers',
    'extra hands',
    'extra legs',
    'extra limbs',
    'fault',
    'flaw',
    'fused fingers',
    'grains',
    'grainy',
    'gross proportions',
    'hazy',
    'identifying mark',
    'improper scale',
    'incorrect physiology',
    'incorrect ratio',
    'indistinct',
    'kitsch',
    'logo',
    'long neck',
    'low quality',
    'low resolution',
    'macabre',
    'malformed',
    'mark',
    'misshapen',
    'missing arms',
    'missing fingers',
    'missing hands',
    'missing legs',
    'mistake',
    'morbid',
    'mutated hands',
    'mutation',
    'mutilated ',
    'off-screen',
    'out of frame',
    'out of frame',
    'outside the picture',
    'pixelated',
    'poorly drawn face',
    'poorly drawn feet',
    'poorly drawn hands',
    'printed words',
    'render',
    'repellent',
    'replicate',
    'reproduce',
    'revolting dimensions',
    'script',
    'shortened',
    'sign',
    'signature',
    'split image',
    'squint',
    'storyboard',
    'text',
    'tiling',
    'trimmed',
    'ugly',
    'unfocused',
    'unattractive',
    'unnatural pose',
    'unreal engine',
    'unsightly',
    'watermark',
    'written language'
  ].join(', ')
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
