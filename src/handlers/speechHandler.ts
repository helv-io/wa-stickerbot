import { createHash } from 'crypto'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import {
  AzureKeyCredential,
  TextAnalyticsClient
} from '@azure/ai-text-analytics'
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
      .outputOptions(['-acodec pcm_s16le', '-ar 16000', '-ac 1'])
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

    console.debug(wavFile, await fs.lstat(wavFile))

    // Initialize Azure SDK Speech Recognition Object from
    // Environment Vars and wav file
    const sConfig = SpeechConfig.fromSubscription(
      botOptions.azureSpeechKey,
      botOptions.azureSpeechRegion
    )

    // Read wav file and create recognizer
    const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wavFile))
    const reco = SpeechRecognizer.FromConfig(
      sConfig,
      AutoDetectSourceLanguageConfig.fromLanguages(botOptions.enabledLanguages),
      aConfig
    )

    // Initialize a transcription string array
    // Audio recognition happens in chunks
    const transcription: string[] = []

    // Append recognized chunk to array
    reco.recognized = async (_sender, event) => {
      transcription.push(event.result.text)

      console.debug(transcription)
      console.debug(_sender, event)
    }

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

    console.debug(reco)
  })
}

export const synthesizeText = async (text: string) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Detect the text language to properly synthesize
      const lang = await detectTextLanguage(text)
      console.log(`Synthesizing: "${text}" in ${lang}`)

      // Create a Speech Configuration
      const sConfig = SpeechConfig.fromSubscription(
        botOptions.azureSpeechKey,
        botOptions.azureSpeechRegion
      )

      // Set the langage
      sConfig.speechSynthesisLanguage = lang

      // Setup up filenames based on text hash
      const hash = createHash('sha256').update(text).digest('hex').slice(0, 8)
      const mp3file = path.join(tmpdir(), `${hash}.mp3`)
      const oggfile = path.join(tmpdir(), `${hash}.opus`)

      // Creates the Synthesizer based on inputs and expected outputs
      const synt = new SpeechSynthesizer(
        sConfig,
        AudioConfig.fromAudioFileOutput(mp3file)
      )

      // Synthesize to ogg file and return it
      synt.speakTextAsync(text, async () => {
        synt.close()
        resolve(
          new Promise<string>(async (resolve, reject) => {
            ffmpeg({ source: mp3file })
              .outputOptions(['-c:a libopus'])
              .on('error', (error) => reject(error))
              .on('end', async () => {
                await fs.unlink(mp3file)
                resolve(oggfile)
              })
              .save(oggfile)
          })
        )
      })
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

export const detectTextLanguage = async (text: string) => {
  // Initialize Azure Text Client
  const client = new TextAnalyticsClient(
    botOptions.azureTextEndpoint,
    new AzureKeyCredential(botOptions.azureTextKey)
  )

  // Send single text to have its language recognized
  const result = (await client.detectLanguage([text]))[0]

  // Return the ln-RG format of the recognized language
  if (!result.error)
    return (
      botOptions.enabledLanguages.find((lang) =>
        lang.startsWith(result.primaryLanguage.iso6391Name)
      ) || botOptions.enabledLanguages[0]
    )

  // Or the first config language if there's an error
  return botOptions.enabledLanguages[0]
}
