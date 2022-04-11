//import { normalize } from 'normalize-diacritics'

export const stickerRegExp = /(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i

export const getTextAction = async (message: string) => {
  if (message) {
    //message = normalize(message.toLowerCase())
    message = message.toLowerCase()

    if (message === 'stats') return actions.STATS
    if (message === 'memes') return actions.MEME_LIST
    if (message === 'link') return actions.LINK
    if (message === 'instrucoes' || message === 'rtfm')
      return actions.INSTRUCTIONS
    if (stickerRegExp.exec(message)) return actions.STICKER
    if (message.startsWith('meme ')) return actions.MEME
    if (message.startsWith('texto ')) return actions.TEXT
  }
}

export enum actions {
  MEME_LIST = 1,
  MEME,
  INSTRUCTIONS,
  STICKER,
  LINK,
  STATS,
  TEXT
}
