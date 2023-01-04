import qs from 'qs'

import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'

export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

export const downloadToBase64 = async (url: string) => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  return Buffer.from(uint8Array).toString('base64')
}