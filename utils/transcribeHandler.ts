import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { botOptions } from '../config'
import fs from 'fs/promises'
import { Message } from '@open-wa/wa-automate'
import { waClient } from '..'
import { ask } from './aiHandler'

export const transcribeAudio = async (wav: string, message: Message) => {
  const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
  sConfig.speechRecognitionLanguage = botOptions.azureLanguage
  const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wav))
  const reco = new SpeechRecognizer(sConfig, aConfig)
  const transcription: string[] = []

  reco.recognized = (_sender, event) => {
    console.log('recognized', event.result)
    transcription.push(event.result.text)
  }

  reco.speechEndDetected = async (_sender, event) => {
    const id = await waClient.sendReplyWithMentions(
      message.from,
      transcription.join(' '),
      message.id
    )
    if (typeof id !== 'boolean')
      await waClient.sendReplyWithMentions(
        message.from,
        `${await ask(transcription.join(' '))}`,
        id
      )
    reco.stopContinuousRecognitionAsync()
    reco.close()
  }

  // Recognize text and exit
  reco.startContinuousRecognitionAsync()
}
