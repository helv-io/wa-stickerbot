import axios from 'axios'
import { GiphyResponse } from 'types/Giphy'
import { TenorResponse, TenorSearch } from 'types/Tenor'

const tenorBaseUrl = 'https://g.tenor.com/v1/search'

export const getTenors = async (search: TenorSearch) => {
  if (!search.key) return []
  const tenors = (
    await axios.get<TenorResponse>('https://g.tenor.com/v1/search', {
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
}
