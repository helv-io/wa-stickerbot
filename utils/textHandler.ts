import { normalize } from 'normalize-diacritics'

export const stickerRegExp = /(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i

export const getTextAction = async (message: string) => {
  message = await normalize(message.toLowerCase())

  if (message === 'memes') return actions.MEME_LIST
  if (message === 'link') return actions.LINK
  if (message === 'instrucoes') return actions.INSTRUCTIONS
  if (stickerRegExp.exec(message)) return actions.STICKER
  if (message.startsWith('meme ')) return actions.MEME
  return null
}

export enum actions {
  MEME_LIST,
  MEME,
  INSTRUCTIONS,
  STICKER,
  LINK
}
