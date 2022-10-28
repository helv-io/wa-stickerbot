import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { botOptions } from '../config'
import fs from 'fs/promises'

export const transbribeAudio = async (wav: string) => {
  const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
  sConfig.speechRecognitionLanguage = botOptions.azureLanguage
  const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wav))
  const reco = new SpeechRecognizer(sConfig, aConfig)
  const transcript: string[] = []

  reco.recognizing = (_sender, event) => {
    console.log('recognizing', event.result)
    transcript.push(event.result.text)
  }

  reco.recognized = (_sender, event) => {
    console.log('recognized', event.result)
    reco.stopContinuousRecognitionAsync()
    reco.close()
  }

  reco.startContinuousRecognitionAsync()

  console.log('Completed Transcription')
  return transcript.join(' ')
}
