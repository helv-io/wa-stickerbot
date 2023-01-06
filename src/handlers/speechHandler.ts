import { createHash } from 'crypto'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import ffmpeg from 'fluent-ffmpeg'
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
  SpeechSynthesizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { MessageMedia } from 'whatsapp-web.js'

import { botOptions } from '../config'

const convertAudio = async (media: MessageMedia) => {
  return new Promise<string>(async (resolve, reject) => {
    const waveFile = path.join(tmpdir(), `${media.filename}.wav`)
    const origFile = path.join(tmpdir(), `${media.filename}.ogg`)
    await fs.writeFile(origFile, media.data, { encoding: 'base64' })

    ffmpeg({ source: origFile })
      .outputOptions([
        '-acodec pcm_s16le',
        '-ar 16000',
        '-ac 1'
      ])
      .on('progress', (progress) => console.log(progress))
      .on('error', (error) => reject(error))
      .on('end', async () => {
        await fs.unlink(origFile)
        resolve(waveFile)
      })
      .save(waveFile)
  })
}

export const transcribeAudio = async (media: MessageMedia) => {
  return new Promise<string>(async (resolve) => {
    let wavFile = ''
    try {
      wavFile = await convertAudio(media)
      const sConfig = SpeechConfig.fromSubscription(
        botOptions.azureKey,
        botOptions.azureRegion
      )
      sConfig.speechRecognitionLanguage = botOptions.azureLanguage
      sConfig.speechSynthesisLanguage = botOptions.azureLanguage
      sConfig.speechSynthesisVoiceName = botOptions.azureVoice
      const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wavFile))
      const reco = new SpeechRecognizer(sConfig, aConfig)
      const transcription: string[] = []

      reco.recognized = (_sender, event) => {
        transcription.push(event.result.text)
      }

      reco.speechEndDetected = async () => {
        reco.stopContinuousRecognitionAsync()
        reco.close()
        resolve(transcription.join(' '))
      }

      // Recognize text and exit
      reco.startContinuousRecognitionAsync()
    } catch (error) {
      console.error(error)
    } finally {
      if (wavFile) {
        console.log('Delete temp file', wavFile)
        await fs.unlink(wavFile)
      }
    }
  })
}

export const synthesizeText = async (text: string) => {
  return new Promise<string>(async (resolve) => {
    try {
      console.log(`Synthesizing: "${text}" in ${botOptions.azureLanguage}`)
      const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
      sConfig.speechSynthesisLanguage = botOptions.azureLanguage
      sConfig.speechSynthesisVoiceName = botOptions.azureVoice
      const hash = createHash('sha256').update(text).digest('hex').slice(0, 8);
      const file = path.join(tmpdir(), `${hash}.ogg`)

      const synt = SpeechSynthesizer.FromConfig(
        sConfig,
        AutoDetectSourceLanguageConfig.fromLanguages([
          'en-US',
          botOptions.azureLanguage
        ]),
        AudioConfig.fromAudioFileOutput(file)
      )
      synt.speakTextAsync(text, async () => {
        synt.close()
        resolve(file)
      })
    } catch (error) {
      console.error(error)
    }
  })
}
