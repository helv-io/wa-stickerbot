import Jimp from 'jimp/*'
import qs from 'qs'

import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'

export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

export const convertGifToWebp = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const gif = await response.arrayBuffer()
  const image = await Jimp.read(Buffer.from(gif))
  return new Promise((resolve, reject) => {
    image.getBuffer('image/webp', (error, webp) => {
      if (error) {
        reject(error)
      } else {
        const base64 = webp.toString('base64')
        resolve(base64)
      }
    })
  })
}
