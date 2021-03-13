import axios from 'axios'
import {
  giphySearch,
  tenorSearch,
  mp4StickerConversionOptions,
  stickerMeta,
  botOptions
} from 'config'
import { GiphyResponse, GiphyGif } from 'types/Giphy'
import { TenorResponse } from 'types/Tenor'
import { stickerRegExp } from './textHandler'

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
