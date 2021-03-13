import {
  ConfigObject,
  Mp4StickerConversionProcessOptions,
  StickerMetadata
} from '@open-wa/wa-automate'
import { GiphySearch } from 'types/Giphy'
import { Imgflip } from 'types/Imgflip'
import { TenorSearch } from 'types/Tenor'

// Begin changes here

// https://docs.openwa.dev/modules/api_model_media.html#stickermetadata
export const stickerMeta: StickerMetadata = {
  author: 'Helvio',
  pack: 'Sticker Bot',
  keepScale: true
}

// https://docs.openwa.dev/interfaces/api_model.configobject.html
export const clientConfig: ConfigObject = {
  sessionId: 'sticker_bot',
  authTimeout: 60,
  blockCrashLogs: false,
  disableSpins: true,
  headless: true,
  logConsole: false,
  logConsoleErrors: true,
  popup: true,
  qrTimeout: 0,
  bypassCSP: true,
  chromiumArgs: ['--no-sandbox']
}

// Number of stickers when seraching for multiples
// Interact with Groups only
// Custom Instructions
export const botOptions = {
  stickers: 10,
  groupsOnly: true,
  interactIn: true,
  interactOut: true,
  inMessage: `meme woman
OLHA QUEM CHEGOU
`,
  outMessage: `meme Left Exit
MEMES STICKERS TRANSAR
CROSSFIT E SOLIDÃO
`,
  instructions: `
*Como falar com o  Bot*
1️⃣ "STICKER(S)/FIGURINHA(S) DE ________"
_o bot vai mandar 3 stickers do tema pedido quando sticker/figurinha estiver no singular e 30 no plural_
2️⃣ “MEMES"
_o bot vai enviar a lista de memes disponíveis para serem feitos_
3️⃣ “meme ________"
_para fazer o meme, é preciso que você digite na primeira linha "meme + nome do meme" e nas próximas linhas, dando enter, o número de frases pelo qual o meme é composto_
EX:
meme drake hotline bling
fazer stickers sozinho
deixar o bot fazer tudo
`
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
  lang: 'pt',
  limit: 1,
  q: 'placeholder',
  type: 'gif'
}

// https://tenor.com/gifapi/documentation#endpoints-search
export const tenorSearch: TenorSearch = {
  key: process.env.TENOR_API || '',
  locale: 'pt_BR',
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
