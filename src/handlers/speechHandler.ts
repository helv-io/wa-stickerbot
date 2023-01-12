import { createHash } from 'crypto'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import { AzureKeyCredential, TextAnalyticsClient } from '@azure/ai-text-analytics'
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
      botOptions.azureSpeechKey,
      botOptions.azureSpeechRegion
    )
    const language = AutoDetectSourceLanguageConfig.fromLanguages(botOptions.enabledLanguages)
    console.log(language)
    // sConfig.speechSynthesisLanguage = language.mode
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
      const lang = await detectLanguage(text)
      console.log(`Synthesizing: "${text}" in ${lang}`)
      const sConfig = SpeechConfig.fromSubscription(botOptions.azureSpeechKey, botOptions.azureSpeechRegion)
      sConfig.speechSynthesisLanguage = lang
      const hash = createHash('sha256').update(text).digest('hex').slice(0, 8);
      const mp3file = path.join(tmpdir(), `${hash}.mp3`)
      const oggfile = path.join(tmpdir(), `${hash}.opus`)

      const synt = SpeechSynthesizer.FromConfig(
        sConfig,
        AutoDetectSourceLanguageConfig.fromLanguages(botOptions.enabledLanguages),
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

export const detectLanguage = async (text: string) => {
  const client = new TextAnalyticsClient(botOptions.azureTextRegion, new AzureKeyCredential(botOptions.azureTextKey));

  const results = await client.detectLanguage([text]);

  for (const result of results) {
    if (!result.error) {
      const primaryLanguage = result.primaryLanguage;
      console.log(
        `\tDetected language: ${primaryLanguage.name} (ISO 6391 code: ${primaryLanguage.iso6391Name})`
      );
      return primaryLanguage.iso6391Name
    } else {
      console.error("\tError:", result.error);
    }
  }
  return botOptions.enabledLanguages[0]
}