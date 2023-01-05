import { exec } from 'child_process'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import util from 'util'

import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { MessageMedia } from 'whatsapp-web.js'

import { botOptions } from '../config'

const run = util.promisify(exec)

const convertAudio = async (media: MessageMedia) => {
  try {
    const origFile = path.join(tmpdir(), `${media.filename}.ogg`)
    const waveFile = path.join(tmpdir(), `${media.filename}.wav`)
    const b64 = media.data
    await fs.writeFile(origFile, b64, { encoding: 'base64' })

    const convertToWav = [
      'ffmpeg',
      '-i',
      origFile,
      '-ac 1',
      '-af aresample=16000',
      '-y',
      waveFile
    ].join(' ')

    // Run conversion
    await run(convertToWav)
    await fs.unlink(origFile)
    return waveFile
  } catch (error) {
    console.error(error)
    return ''
  }
}

export const transcribeAudio = async (media: MessageMedia) => {
  return new Promise<string>(async (resolve) => {
    const sConfig = SpeechConfig.fromSubscription(
      botOptions.azureKey,
      botOptions.azureRegion
    )
    sConfig.speechRecognitionLanguage = botOptions.azureLanguage
    sConfig.speechSynthesisLanguage = botOptions.azureLanguage
    sConfig.speechSynthesisVoiceName = botOptions.azureVoice
    const wav = await convertAudio(media)
    const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wav))
    const reco = new SpeechRecognizer(sConfig, aConfig)
    const transcription: string[] = []

    reco.recognized = (_sender, event) => {
      transcription.push(event.result.text)
    }

    reco.speechEndDetected = async () => {
      reco.stopContinuousRecognitionAsync()
      reco.close()
      await fs.unlink(wav)
      resolve(transcription.join(' '))
    }

    // Recognize text and exit
    reco.startContinuousRecognitionAsync()
  })
}

/*
export const synthesizeText = async (text: string, message: Message) => {
  console.log(`Synthesizing: "${text}" in ${botOptions.azureLanguage}`)
  const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
  sConfig.speechSynthesisLanguage = botOptions.azureLanguage
  sConfig.speechSynthesisVoiceName = 'pt-BR-FabioNeural'
  const file = path.join(tmpdir(), `${message.id}.mp3`)

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
    await waClient.sendPtt(message.from, file, message.id)
    await fs.unlink(file)
  })
}
*/
