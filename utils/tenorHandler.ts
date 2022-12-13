import { TenorResponse, TenorSearch } from '../types/Tenor'

const tenorURL = 'https://g.tenor.com/v1/search?'

export const getTenors = async (search: TenorSearch) => {
  if (!search.key) return []
  try {
    const params = `key=${search.key}&q=${search.q}&limit=${search.limit}&locale=${search.locale}&media_filter=${search.media_filter}&type=${search.type}`
    const tenors: TenorResponse = await (await fetch(tenorURL + params)).json()

    const urls: string[] = []
    tenors.results.forEach((tenor) =>
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
