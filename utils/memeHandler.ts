import { Meme } from '../types/Meme'

const memesBaseURL = 'https://meme.helv.io'
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
      arr[i] = encodeURIComponent(
        line
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
      )
    })
    const url = `${memeMakeURL}/${meme.id}/${memeLines.join('/')}.gif`
    console.log(url)
    return url
  }
  return ''
}

export const getMemeList = async () => {
  const memes = (await getMemes()).sort((a, b) => (a.name > b.name ? 1 : -1))
  let response = ''
  memes.forEach((meme) => (response += `${meme.name} (${meme.lines})\n`))
  return response
}

export const getMemes = async () => {
  return <Meme[]>await (await fetch(memesGetURL)).json()
}
