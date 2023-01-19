import qs from 'qs'
import sharp from 'sharp'
import { MessageMedia } from 'whatsapp-web.js'

import { imgproxy } from '../config'
import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'

export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

export const proxyImage = async (url: string) => {
  // Do nothing if imgproxy is not set
  if (!imgproxy) return await MessageMedia.fromUrl(url, { unsafeMime: true })
  const proxyUrl = imgproxy.builder().format('webp').generateUrl(url)
  return await MessageMedia.fromUrl(proxyUrl, { unsafeMime: true })
}

// Convert a Buffer or Base64 image to webp. Return same type as input.
export const convertToWebp = async (img: Buffer | string) => {
  let inputBuffer = true
  if (typeof img === 'string') {
    img = Buffer.from(img, 'base64')
    inputBuffer = false
  }

  const buffer = await sharp(img, { animated: true })
    .resize(512, 512, { fit: 'inside' })
    .webp()
    .toBuffer()

  if (inputBuffer) return buffer
  return buffer.toString('base64')
}

// Make MessageMedia into round image.
export const roundImage = async (media: MessageMedia) => {
  const img = Buffer.from(media.data, 'base64')
  const round = Buffer.from('<svg><rect x="0" y="0" width="512" height="512" rx="256" ry="256"/></svg>')

  media.data = (await sharp(img, { animated: true })
    .resize(512, 512, { fit: 'inside' })
    .composite([{
      input: round,
      blend: 'dest-in'
    }])
    .webp()
    .toBuffer())
    .toString('base64')

  media.filesize = media.data.length

  console.log(media)
  return media
}
