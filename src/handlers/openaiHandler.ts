import { createHash } from 'crypto'
import { tmpdir } from 'os'
import path from 'path'
import * as fs from 'fs'
import { openaiConfig } from '../config'

export const trump = async (tts: string) => {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: tts,
      voice: 'trump',
      response_format: 'opus'
    })
  }

  const response = await fetch(`${openaiConfig.baseUrl}/v1/audio/speech`, request)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const hash = createHash('sha256').update(tts).digest('hex').slice(0, 8)
  const file = path.join(tmpdir(), `trump-${hash}.ogg`)

  fs.writeFileSync(file, new Uint8Array(await response.arrayBuffer()))

  return file
}

export const elon = async (tts: string) => {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: tts,
      voice: 'elon',
      response_format: 'opus'
    })
  }

  const response = await fetch(`${openaiConfig.baseUrl}/v1/audio/speech`, request)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const hash = createHash('sha256').update(tts).digest('hex').slice(0, 8)
  const file = path.join(tmpdir(), `elon-${hash}.ogg`)

  fs.writeFileSync(file, new Uint8Array(await response.arrayBuffer()))

  return file
}

export const bolsonaro = async (tts: string) => {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: tts,
      voice: 'bolsonaro',
      response_format: 'opus'
    })
  }

  const response = await fetch(`${openaiConfig.baseUrl}/v1/audio/speech`, request)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const hash = createHash('sha256').update(tts).digest('hex').slice(0, 8)
  const file = path.join(tmpdir(), `bolsonaro-${hash}.ogg`)

  fs.writeFileSync(file, new Uint8Array(await response.arrayBuffer()))

  return file
}
