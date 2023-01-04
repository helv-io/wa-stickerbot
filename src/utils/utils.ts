import qs from 'qs'

import { imgproxy } from '../config'
import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'

export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

export const proxyImageURL = (url: string) => {
  console.log(imgproxy)
  // Do nothing if imgproxy is not set
  if (!imgproxy) return url
  const proxyUrl = imgproxy.builder().format('webp').generateUrl(url)
  console.log(url, proxyUrl)
  return proxyUrl
}
