import { GiphyResponse, GiphySearch } from '../types/Giphy'
import axios from 'axios'

const giphyBaseUrl = 'https://api.giphy.com/v1'

export const getGiphys = async (search: GiphySearch) => {
  if (!search.api_key) return []
  try {
    const giphys = (
      await axios.get<GiphyResponse>(`${giphyBaseUrl}/gifs/search`, {
        params: search
      })
    ).data.data.concat(
      (
        await axios.get<GiphyResponse>(`${giphyBaseUrl}/stickers/search`, {
          params: search
        })
      ).data.data
    )

    const urls: string[] = []
    giphys.forEach((giphy) =>
      urls.push(
        (giphy.images.original.webp_size <= '1400000'
          ? giphy.images.original.webp
          : giphy.images.fixed_width.webp
        ).replace(/media[0-9]/, 'i')
      )
    )
    return urls
  } catch (e) {
    console.error(e)
    return []
  }
}
