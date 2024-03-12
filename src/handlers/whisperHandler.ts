import { botOptions } from '../config'
import axios from 'axios'
import * as fs from 'fs'

export const transcribeAudio = async (filename: string, data: string) => {
    const form = new FormData()
    const blob = new Blob([Buffer.from(data, 'base64')])
    form.append('audio_file', blob, filename)
    const response = await axios.post(`${botOptions.whisperEndpoint}/asr`, form)
    console.debug(response)
    return await response.data
}