import { GiphyResponse, GiphySearch } from '../types/Giphy'
import { paramSerializer } from '../utils/utils'

const giphyBaseUrl = 'https://api.giphy.com/v1'

export const getGiphys = async (search: GiphySearch) => {
  if (!search.api_key) return []
  const params = paramSerializer(search)
  try {
    // Fetch gifs
    const gifs: GiphyResponse = await (
      await fetch(`${giphyBaseUrl}/gifs/search?${params}`)
    ).json()

    // Fetch stickers
    const stickers: GiphyResponse = await (
      await fetch(`${giphyBaseUrl}/stickers/search?${params}`)
    ).json()

    // Merge them
    const giphys = gifs.data.concat(stickers.data)

    const urls: string[] = []
    for (const giphy of giphys)
      urls.push(`https://i.giphy.com/media/${giphy.id}/200.webp`)

    return urls
  } catch (e) {
    console.error(e)
    return []
  }
}
