import fs from 'fs/promises'

import {
  AudioConfig, SpeechConfig,
  SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { Message } from 'whatsapp-web.js'

import { botOptions } from '../config'


export const transcribeAudio = async (wav: string, message: Message) => {
  console.log(`Reconizing speech from "${message.from}`)
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
    await message.reply(
      transcription.join(' ')
    )
    reco.stopContinuousRecognitionAsync()
    reco.close()
  }

  // Recognize text and exit
  reco.startContinuousRecognitionAsync()
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
