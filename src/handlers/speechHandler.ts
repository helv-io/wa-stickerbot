import fs from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import { Message } from '@open-wa/wa-automate'
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
  SpeechSynthesizer
} from 'microsoft-cognitiveservices-speech-sdk'

import { botOptions } from '../config'
import { waClient } from '../index'

import { ask } from './aiHandler'

export const transcribeAudio = async (wav: string, message: Message) => {
  console.log(`Reconizing speech from "${message.sender.formattedName}`)
  const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
  sConfig.speechRecognitionLanguage = botOptions.azureLanguage
  sConfig.speechSynthesisLanguage = botOptions.azureLanguage
  sConfig.speechSynthesisVoiceName = 'pt-BR-FabioNeural'
  const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wav))
  const reco = new SpeechRecognizer(sConfig, aConfig)
  const transcription: string[] = []

  reco.recognized = (_sender, event) => {
    transcription.push(event.result.text)
  }

  reco.speechEndDetected = async () => {
    const id = await waClient.sendReplyWithMentions(
      message.from,
      transcription.join(' '),
      message.id
    )
    reco.stopContinuousRecognitionAsync()
    reco.close()

    if (typeof id !== 'boolean') {
      const ai = `${await ask(transcription.join(' '), message.sender.id)}`
      await synthesizeText(ai, message)
    }
  }

  // Recognize text and exit
  reco.startContinuousRecognitionAsync()
}

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