import {
  AzureKeyCredential,
  TextAnalyticsClient
} from '@azure/ai-text-analytics'
import { createHash } from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  ProfanityOption,
  SpeechConfig,
  SpeechRecognizer,
  SpeechSynthesizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { tmpdir } from 'os'
import path from 'path'

import { AzureConfig } from '../config'

const convertAudio = async (filename: string, data: string) => {
  return new Promise<string>((resolve, reject) => {
    (async () => {
      // Initialize the temporary files
      const waveFile = path.join(tmpdir(), `${filename}.wav`)
      const origFile = path.join(tmpdir(), `${filename}.ogg`)
      await fs.writeFile(origFile, data, { encoding: 'base64' })

      // Azure requires PCM 16K with 1 channel
      ffmpeg({ source: origFile })
        .outputOptions(['-acodec pcm_s16le', '-ar 16000', '-ac 1'])
        .on('error', (error) => reject(error))
        .on('end', async () => {
          await fs.unlink(origFile)
          resolve(waveFile)
        })
        .save(waveFile)
    })().catch((error) => reject(error))
  })
}


export const transcribeAudio = async (filename: string, data: string) => {
  // Since the Transcription is an asynchronous streaming service,
  // the whole function must be wrapped as a Promise
  return new Promise<string>((resolve, reject) => {
    (async () => {
    // Convert ogg file to wav
      const wavFile = await convertAudio(filename, data)

      // Initialize Azure SDK Speech Recognition Object from
      // Environment Vars and wav file
      const sConfig = SpeechConfig.fromSubscription(
        AzureConfig.azureSpeechKey,
        AzureConfig.azureSpeechRegion
      )

      // Allow profanity
      sConfig.setProfanity(ProfanityOption.Raw)

      // Read wav file and create recognizer
      const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wavFile))
      const reco = SpeechRecognizer.FromConfig(
        sConfig,
        AutoDetectSourceLanguageConfig.fromLanguages(AzureConfig.enabledLanguages),
        aConfig
      )

      // Initialize a transcription string array
      // Audio recognition happens in chunks
      const transcription: string[] = []

      // Append recognized chunk to array
      reco.recognized = async (_sender, event) =>
        transcription.push(event.result.text)

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
    })().catch((error) => reject(error))
  })
}

export const synthesizeText = async (text: string) => {
  return new Promise<string>((resolve, reject) => {
    (async () => {
      try {
      // Detect the text language to properly synthesize
        const lang = await detectTextLanguage(text)

        // Create a Speech Configuration
        const sConfig = SpeechConfig.fromSubscription(
          AzureConfig.azureSpeechKey,
          AzureConfig.azureSpeechRegion
        )

        // Set the langage
        sConfig.speechSynthesisLanguage = lang

        // Setup up filenames based on text hash
        const hash = createHash('sha256').update(text).digest('hex').slice(0, 8)
        const mp3file = path.join(tmpdir(), `${hash}.mp3`)
        const oggfile = path.join(tmpdir(), `${hash}.opus`)

        // Get list of available voices for a given language
        const voiceClient = new SpeechSynthesizer(sConfig)
        const voices = (await voiceClient.getVoicesAsync()).voices.filter(v => v.locale.startsWith(lang))
        const voice = voices[Math.floor(Math.random() * voices.length)]

        console.log(`Synthesizing: "${text}" in ${lang} using ${voice.displayName}`)

        // Use a random voice
        sConfig.speechSynthesisVoiceName = voice.shortName

        // Creates the Synthesizer based on inputs and expected outputs
        const synt = new SpeechSynthesizer(
          sConfig,
          AudioConfig.fromAudioFileOutput(mp3file)
        )

        // Synthesize to ogg file and return it
        synt.speakTextAsync(text, async () => {
          synt.close()
          resolve(
            new Promise<string>((resolve, reject) => {
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
    })().catch((error) => reject(error))
  })
}

export const detectTextLanguage = async (text: string) => {
  // Initialize Azure Text Client
  const client = new TextAnalyticsClient(
    AzureConfig.azureTextEndpoint,
    new AzureKeyCredential(AzureConfig.azureTextKey)
  )

  // Send single text to have its language recognized
  const result = (await client.detectLanguage([text]))[0]

  // Return the ln-RG format of the recognized language
  if (!result.error)
    return (
      AzureConfig.enabledLanguages.find((lang) =>
        lang.startsWith(result.primaryLanguage.iso6391Name)
      ) || AzureConfig.enabledLanguages[0]
    )

  // Or the first config language if there's an error
  return AzureConfig.enabledLanguages[0]
}
