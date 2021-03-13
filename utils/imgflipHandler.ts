import axios from 'axios'
import { imgflip } from '../config'
import { ImgflipResponse } from '../types/Imgflip'
import { paramSerializer } from './utils'

const imgflipBaseURL = 'https://api.imgflip.com'
const imgflipGetMemesURL = `${imgflipBaseURL}/get_memes`
const imgflipCaptionImageURL = `${imgflipBaseURL}/caption_image`

export const getImgflipImage = async (body: string) => {
  if (!imgflip.username) return ''

  const memeMeta = body.split('\n')
  const memeTitle = (memeMeta.shift() || '').toLowerCase().replace('meme ', '')
  const memes = await getImgflipMemes()
  const meme = memes.find((m) => m.name.toLowerCase().includes(memeTitle))

  if (meme) {
    imgflip.template_id = meme.id
    imgflip.boxes = []
    for (let i = 1; i < memeMeta.length; i++) {
      imgflip.boxes.push({ text: memeMeta[i] })
    }
    return (
      (
        await axios.get<ImgflipResponse>(
          `${imgflipCaptionImageURL}?${paramSerializer(imgflip)}`
        )
      ).data.data.url || ''
    )
  }
  return ''
}

export const getImgflipList = async () => {
  if (!imgflip.username) return ''
  const memes = await getImgflipMemes()
  let response = ''
  memes.forEach((meme) => (response += `${meme.name} (${meme.box_count})\n`))
  return response
}

export const getImgflipMemes = async () => {
  return (await axios.get<ImgflipResponse>(imgflipGetMemesURL)).data.data.memes
}
