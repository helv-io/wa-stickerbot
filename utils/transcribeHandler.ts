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
  let transcript: string = ''

  reco.recognized = (_sender, event) => {
    console.log('recognized', event.result)
    transcript = event.result.text
    reco.close()
  }

  // Recognize text and exit
  reco.recognizeOnceAsync()
  console.log('Completed Transcription')
  return transcript
}
