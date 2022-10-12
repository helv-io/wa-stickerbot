import axios from 'axios'
import { TenorResponse, TenorSearch } from '../types/Tenor'

const tenorURL = 'https://g.tenor.com/v1/search'

export const getTenors = async (search: TenorSearch) => {
  if (!search.key) return []
  try {
    const tenors = (
      await axios.get<TenorResponse>(tenorURL, {
        params: search
      })
    ).data.results

    const urls: string[] = []
    tenors.forEach((tenor) =>
      urls.push(
        tenor.media[0].gif.size <= 1400000
          ? tenor.media[0].gif.url
          : tenor.media[0].tinygif.url
      )
    )
    return urls
  } catch (e) {
    console.error(e)
    return []
  }
}
