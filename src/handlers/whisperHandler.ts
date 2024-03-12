import { botOptions } from '../config'
import axios from 'axios'
import * as fs from 'fs'

export const transcribeAudio = async (filename: string, data: string) => {
    const form = new FormData()
    const blob = new Blob([Buffer.from(data, 'base64')])
    form.append('audio_file', blob, filename)
    try {
        const response = await axios.post(`${botOptions.whisperEndpoint}/asr`, form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log(response)
        return await response.data
    } catch (e) {
        console.error(e)
        return 'Womp Womp Womp'
    }
}