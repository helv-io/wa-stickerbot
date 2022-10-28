import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { botOptions } from '../config'
import fs from 'fs/promises'
import { Message } from '@open-wa/wa-automate'
import { waClient } from '..'

export const transcribeAudio = async (wav: string, message: Message) => {
  const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
  sConfig.speechRecognitionLanguage = botOptions.azureLanguage
  const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wav))
  const reco = new SpeechRecognizer(sConfig, aConfig)
  const transcript: string[] = []

  reco.recognizing = (_sender, event) => {
    console.log('recognizing', event.result)
    transcript.push(event.result.text)
  }

  reco.recognized = async (_sender, event) => {
    console.log('recognized', event.result)
    await waClient.sendReplyWithMentions(
      message.from,
      event.result.text,
      message.id
    )
    await waClient.sendReplyWithMentions(
      message.from,
      transcript.join(' '),
      message.id
    )
    reco.stopContinuousRecognitionAsync()
    reco.close()
  }

  // Recognize text and exit
  reco.startContinuousRecognitionAsync()
}
