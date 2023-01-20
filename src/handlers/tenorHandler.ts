import { TenorResponse, TenorSearch } from '../types/Tenor'
import { paramSerializer } from '../utils/utils'

const tenorURL = 'https://tenor.googleapis.com/v2/search?'

export const getTenors = async (search: TenorSearch) => {
  if (!search.key) return []
  try {
    const params = paramSerializer(search)
    const tenors: TenorResponse = await (await fetch(tenorURL + params)).json()

    const urls: string[] = []
    for (const tenor of tenors.results)
      urls.push(
        tenor.media_formats.webp_transparent?.url || tenor.media_formats.gif.url
      )

    return urls
  } catch (e) {
    console.error(e)
    return []
  }
}
