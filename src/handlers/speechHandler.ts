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
    // Initialize the temporary files
    const waveFile = path.join(tmpdir(), `${media.filename}.wav`)
    const origFile = path.join(tmpdir(), `${media.filename}.ogg`)
    await fs.writeFile(origFile, media.data, { encoding: 'base64' })

    // Azure requires PCM 16K with 1 channel
    ffmpeg({ source: origFile })
      .outputOptions([
        '-acodec pcm_s16le',
        '-ar 16000',
        '-ac 1'
      ])
      .on('error', (error) => reject(error))
      .on('end', async () => {
        await fs.unlink(origFile)
        resolve(waveFile)
      })
      .save(waveFile)
  })
}

export const transcribeAudio = async (media: MessageMedia) => {
  // Since the Transcription is an asynchronous streaming service,
  // the whole function must be wrapped as a Promise
  return new Promise<string>(async (resolve) => {
    // Convert ogg file to wav
    const wavFile = await convertAudio(media)

    // Initialize Azure SDK Speech Recognition Object from
    // Environment Vars and wav file
    const sConfig = SpeechConfig.fromSubscription(
      botOptions.azureKey,
      botOptions.azureRegion
    )
    sConfig.speechRecognitionLanguage = botOptions.azureLanguage
    sConfig.speechSynthesisLanguage = botOptions.azureLanguage
    sConfig.speechSynthesisVoiceName = botOptions.azureVoice
    const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wavFile))
    const reco = new SpeechRecognizer(sConfig, aConfig)

    // Initialize a transcription string array
    // Audio recognition happens in chunks
    const transcription: string[] = []

    // Append recognized chunk to array
    reco.recognized = (_sender, event) => transcription.push(event.result.text)

    // When recognition ends, close the Speech Recognizer
    reco.speechEndDetected = async () => {
      reco.stopContinuousRecognitionAsync()
      reco.close()
      // Delete audio file and return transcription
      await fs.unlink(wavFile)
      resolve(transcription.join(' '))
    }

    // Start the recognition
    reco.startContinuousRecognitionAsync()
  })
}

export const synthesizeText = async (text: string) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      console.log(`Synthesizing: "${text}" in ${botOptions.azureLanguage}`)
      const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
      sConfig.speechSynthesisLanguage = botOptions.azureLanguage
      sConfig.speechSynthesisVoiceName = botOptions.azureVoice
      const hash = createHash('sha256').update(text).digest('hex').slice(0, 8);
      const mp3file = path.join(tmpdir(), `${hash}.mp3`)
      const oggfile = path.join(tmpdir(), `${hash}.opus`)

      const synt = SpeechSynthesizer.FromConfig(
        sConfig,
        AutoDetectSourceLanguageConfig.fromLanguages([
          'en-US',
          botOptions.azureLanguage
        ]),
        AudioConfig.fromAudioFileOutput(mp3file)
      )
      synt.speakTextAsync(text, async () => {
        synt.close()
        resolve(new Promise<string>(async (resolve, reject) => {
          ffmpeg({ source: mp3file })
            .outputOptions([
              '-c:a libopus'
            ])
            .on('error', (error) => reject(error))
            .on('end', async () => {
              await fs.unlink(mp3file)
              resolve(oggfile)
            })
            .save(oggfile)
        }))
      })
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}
