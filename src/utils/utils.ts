import fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import ffmpeg from 'fluent-ffmpeg'
import qs from 'qs'
import sharp from 'sharp'
import { MessageMedia } from 'whatsapp-web.js'

import { imgproxy } from '../config'
import { GiphySearch } from '../types/Giphy'
import { TenorSearch } from '../types/Tenor'


export const paramSerializer = (p: TenorSearch | GiphySearch) => {
  return qs.stringify(p, { arrayFormat: 'brackets' })
}

// Random true based on 1:odds
export const oneChanceIn = (odds: number) => {
  return Math.floor(Math.random() * odds) === 0
}

export const proxyImage = async (url: string) => {
  // Do nothing if imgproxy is not set
  if (!imgproxy) return await MessageMedia.fromUrl(url, { unsafeMime: true })
  const proxyUrl = imgproxy.builder().format('webp').generateUrl(url)
  return await MessageMedia.fromUrl(proxyUrl, { unsafeMime: true })
}

export const stickerToGif = async (media: MessageMedia) => {
  const buffer = Buffer.from(media.data, 'base64')
  media.data = (await sharp(buffer, { animated: true })
    .gif()
    .toBuffer()).toString('base64')
  media.filename = 'sticker.gif'
  media.mimetype = 'image/gif'
  media.filesize = media.data.length

  await fs.writeFile('/data/stickerToGif.gif', media.data, 'base64')

  return media
}

// Make MessageMedia into badge.
export const badge = async (media: MessageMedia) => {
  let extension = media.mimetype.split('/')[1].toLowerCase()
  // Convert to GIF if it's MP4
  if (extension === 'mp4') {
    media = await mp4ToGif(media)
    extension = 'gif'
  }

  // Read media as Buffer
  const img = Buffer.from(media.data, 'base64')

  // Badge overlay
  const badge = Buffer.from(
    '<svg><circle cx="256" cy="256" r="256"/></svg>'
  )

  // Convert to (animated) webp badge and update media metadata
  media.data = (
    await sharp(img, { animated: true })
      .resize(512, 512, { fit: 'cover' })
      .webp({ effort: 6, quality: 50 })
      .composite([
        {
          input: badge,
          blend: 'dest-in',
          tile: true,
          gravity: 'northwest'
        }
      ])
      .toBuffer()
  ).toString('base64')
  media.filesize = media.data.length
  media.mimetype = 'image/webp'
  media.filename = media.filename?.replace(extension, 'webp')

  await fs.writeFile('/data/animated.webp', media.data, 'base64')

  // All done, return the modified media object
  return media
}

// Use ffmpeg to convert mp4 to gif so it can be used with sharp
const mp4ToGif = async (media: MessageMedia) => {

  // Create a file path and save the mp4
  const mp4File = path.join(tmpdir(), media.filename || '')
  await fs.writeFile(mp4File, media.data, { encoding: 'base64' })

  // Use ffmpeg to convert the file and return new file path (gif)
  const gifFile = await new Promise<string>(async (resolve, reject) => {
    ffmpeg({ source: mp4File })
      .on('error', (error) => reject(error))
      .on('end', async () => {
        // Delete the mp4 when conversion ends
        await fs.unlink(mp4File)
        resolve(mp4File.replace('mp4', 'gif'))
      })
      .save(mp4File.replace('mp4', 'gif'))
  })
  // Replace media.data with gif data and adjust size/mime
  media.data = await fs.readFile(gifFile, { encoding: 'base64' })
  media.filesize = media.data.length
  media.mimetype = 'image/gif'
  media.filename = media.filename?.replace('.mp4', '.gif')

  // Delete gif file
  await fs.unlink(gifFile)
  // Return the new media object
  return media
}
