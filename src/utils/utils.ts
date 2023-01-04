import qs from 'qs'

import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'

export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

export const downloadToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const data = await response.blob()
  const reader = new FileReader()
  reader.readAsDataURL(data)
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
