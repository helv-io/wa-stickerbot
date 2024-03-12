import axios from 'axios'
import formdata from 'form-data'

import { botOptions } from '../config'

export const transcribeAudio = async (filename: string, data: string) => {
  const form = new formdata()
  form.append('audio_file', Buffer.from(data, 'base64'), filename)
  const headers = {'Content-Type': 'multipart/form-data'}
  return (await axios.post<string>(`${botOptions.whisperEndpoint}/asr`, form, { headers })).data
}

export const translateAudio = async (filename: string, data: string) => {
  const lang = await detectLanguage(filename, data)
  if (lang === 'en')
    return ''
  const form = new formdata()
  form.append('audio_file', Buffer.from(data, 'base64'), filename)
  const headers = {'Content-Type': 'multipart/form-data'}
  return (await axios.post<string>(
    `${botOptions.whisperEndpoint}/asr?task=translate`,
    form, { headers })).data
}

const detectLanguage = async (filename: string, data: string) => {
  const form = new formdata()
  form.append('audio_file', Buffer.from(data, 'base64'), filename)
  const headers = {'Content-Type': 'multipart/form-data'}
  return (
    await axios.post<{detected_language: string, language_code: string}>
    (`${botOptions.whisperEndpoint}/detect-language`, form, { headers })).data.language_code
}
