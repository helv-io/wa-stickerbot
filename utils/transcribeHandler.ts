import {
  AudioConfig,
  Recognizer,
  SpeechConfig,
  SpeechRecognitionEventArgs,
  SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { botOptions } from '../config'
import fs from 'fs/promises'

export const transbribeAudio = async (wav: string, transcript = '') => {
  const sConfig = SpeechConfig.fromSubscription(
    botOptions.microsoftApiKey,
    'eastus'
  )
  sConfig.speechRecognitionLanguage = botOptions.microsoftLanguage
  const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wav))
  const reco = new SpeechRecognizer(sConfig, aConfig)

  const transcribe = (
    _sender: Recognizer,
    event: SpeechRecognitionEventArgs
  ) => {
    transcript += event.result.text
  }

  reco.recognizing = transcribe
  reco.recognized = transcribe

  reco.startContinuousRecognitionAsync()

  return transcript
}
