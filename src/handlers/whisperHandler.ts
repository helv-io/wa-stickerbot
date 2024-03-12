import axios from 'axios'
import formdata from 'form-data'

import { botOptions } from '../config'

export const transcribeAudio = async (filename: string, data: string) => {
  const form = new formdata()
  form.append('audio_file', Buffer.from(data, 'base64'), filename)
  const headers = {'Content-Type': 'multipart/form-data'}
  try {
    const response = await axios.post<string>(`${botOptions.whisperEndpoint}/asr`, form, {headers})
    return response.data
  } catch (e) {
    console.error(e)
    return ''
  }
}
