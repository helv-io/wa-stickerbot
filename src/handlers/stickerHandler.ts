import { botOptions, giphySearch, tenorSearch } from '../config.js'
import { stickerRegExp } from '../handlers/textHandler.js'

export const getStickerSearches = (message: string) => {
  const keywords = stickerRegExp.exec(message) || []
  const limit = keywords[2].toLowerCase() === 's' ? botOptions.stickers : 1
  const q = keywords[3]

  giphySearch.limit = limit
  tenorSearch.limit = limit
  giphySearch.q = q
  tenorSearch.q = q

  return { giphySearch, tenorSearch }
}
