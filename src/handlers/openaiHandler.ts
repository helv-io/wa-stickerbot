import { createHash } from 'crypto'
import { tmpdir } from 'os'
import path from 'path'
import * as fs from 'fs'
import { openaiConfig } from '../config'

export const trumpit = async (tts: string) => {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: openaiConfig.model,
      input: tts,
      voice: openaiConfig.voice,
      response_format: 'opus'
    })
  }

  const response = await fetch(`${openaiConfig.baseUrl}/v1/audio/speech`, request)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const hash = createHash('sha256').update(tts).digest('hex').slice(0, 8)
  const file = path.join(tmpdir(), `${hash}.ogg`)

  fs.writeFileSync(file, new Uint8Array(await response.arrayBuffer()))

  return file
}
