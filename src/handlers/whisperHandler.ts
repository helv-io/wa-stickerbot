import { botOptions } from '../config'
import axios from 'axios'
import formdata from 'form-data'

export const transcribeAudio = async (filename: string, data: string) => {
    const form = new formdata()
    form.append('audio_file', Buffer.from(data, 'base64'), filename)
    try {
        const response = await axios.post<string>(`${botOptions.whisperEndpoint}/asr`, form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log(response)
        return response.data
    } catch (e) {
        console.error(e)
        return 'Womp Womp Womp'
    }
}