import qs from 'qs'
import * as sharp from 'sharp'

import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'

export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

export const toWebP = async (gifUrl: string) => {
  const gif = await (await fetch(gifUrl)).arrayBuffer()
  return await (await sharp.default(Buffer.from(gif)).webp().toBuffer()).toString('base64')
}