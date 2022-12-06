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
    memeLines.forEach((line, i, arr) => {
      // Replace special characters
      // https://memegen.link/#special-characters
      arr[i] = line
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
    const url = `${memeMakeURL}/${meme.id}/${memeLines.join('/')}.gif`
    console.log(url)
    return url
  }
  return ''
}

export const getMemeList = async () => {
  const memes = await getMemes()
  let response = ''
  memes.forEach((meme) => (response += `${meme.name} (${meme.lines})\n`))
  memes.sort((a, b) => (a.name > b.name ? 1 : -1))
  return response
}

export const getMemes = async () => {
  return <Meme[]>await (await fetch(memesGetURL)).json()
}
