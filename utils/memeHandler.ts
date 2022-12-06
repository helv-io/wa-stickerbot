import { Meme } from '../types/Meme'
import axios from 'axios'

const memesBaseURL = 'https://api.memegen.link'
const memesGetURL = `${memesBaseURL}/templates`
const memeMakeURL = `${memesBaseURL}/images`

export const makeMeme = async (body: string) => {
  const memeLines = body.split('\n')
  const memeTitle = (memeLines.shift() || '')
    .toLowerCase()
    .replace('meme ', '')
    .trim()
  const memes = await getMemes()
  const meme = memes.find((m) => m.name.toLowerCase().includes(memeTitle))

  if (meme && memeLines.length === meme.lines) {
    memeLines.forEach((line) => {
      // Replace special characters
      // https://memegen.link/#special-characters
      line = line
        .replaceAll('?', '~q')
        .replaceAll('&', '~a')
        .replaceAll('%', '~p')
        .replaceAll('#', '~h')
        .replaceAll('/', '~s')
        .replaceAll('\\', '~b')
        .replaceAll('<', '~l')
        .replaceAll('>', '~g')
        .replaceAll('"', "''")
        .replaceAll('-', '--')
        .replaceAll('_', '__')
        .replaceAll(' ', '_')
    })
    return `${memeMakeURL}/${meme.id}/${memeLines.join('/')}.gif`
  }
  return ''
}

export const getMemeList = async () => {
  const memes = await getMemes()
  console.log(memes)
  let response = ''
  memes.forEach((meme) => (response += `${meme.name} (${meme.lines})\n`))
  return response
}

export const getMemes = async () => {
  const response = await fetch(memesGetURL)
  console.log(response)
  const memes: Meme[] = await response.json()
  console.log(memes)
  return memes
}
