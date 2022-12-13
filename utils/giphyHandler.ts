import { GiphyResponse, GiphySearch } from '../types/Giphy'


const giphyBaseUrl = 'https://api.giphy.com/v1'

export const getGiphys = async (search: GiphySearch) => {
  if (!search.api_key) return []
  const params = `api_key=${search.api_key}&lang=${search.lang}&limit=${search.limit}&q=${search.q}&type=${search.type}`
  try {
    const gifs: GiphyResponse = (await (await fetch(`${giphyBaseUrl}/gifs/search?${params}`)).json())
    const stickers: GiphyResponse = (await (await fetch(`${giphyBaseUrl}/stickers/search?${params}`)).json())
    const giphys = gifs.data.concat(stickers.data)

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
