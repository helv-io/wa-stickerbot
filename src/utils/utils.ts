import Jimp from 'jimp/*'
import qs from 'qs'
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
  if (!imgproxy) return await MessageMedia.fromUrl(url)
  const proxyUrl = imgproxy.builder().format('webp').generateUrl(url)
  return await MessageMedia.fromUrl(proxyUrl, { unsafeMime: true })
}

export const autoCrop = async (b64: string) => {
  // Load the image into Jimp
  const image = await Jimp.read(Buffer.from(b64, 'base64'))

  // Find the boundaries of the region to keep
  let top = 0
  let bottom = image.getHeight()
  let left = 0
  let right = image.getWidth()
  // Pixels with a value lower than this will be considered "empty"
  const threshold = 128
  for (let y = 0; y < image.getHeight(); y++) {
    for (let x = 0; x < image.getWidth(); x++) {
      const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y))
      if (
        pixelColor.r > threshold ||
        pixelColor.g > threshold ||
        pixelColor.b > threshold
      ) {
        // This pixel is not "empty", so update the boundaries
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
        left = Math.min(left, x)
        right = Math.max(right, x)
      }
    }
  }

  // Crop the image to the boundaries of the region
  const croppedImage = image.crop(left, top, right - left, bottom - top);

  // Convert the image to a base64 encoded string
  return await croppedImage.getBase64Async(Jimp.MIME_PNG);
}
