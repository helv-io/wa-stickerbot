import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
  SpeechSynthesizer
} from 'microsoft-cognitiveservices-speech-sdk'
import { botOptions } from '../config'
import fs from 'fs/promises'
import { Message } from '@open-wa/wa-automate'
import { waClient } from '..'
import { ask } from './aiHandler'

export const transcribeAudio = async (wav: string, message: Message) => {
  const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
  sConfig.speechRecognitionLanguage = botOptions.azureLanguage
  sConfig.speechSynthesisLanguage = botOptions.azureLanguage
  sConfig.speechSynthesisVoiceName = 'pt-BR-FabioNeural'
  const aConfig = AudioConfig.fromWavFileInput(await fs.readFile(wav))
  const reco = new SpeechRecognizer(sConfig, aConfig)
  const transcription: string[] = []

  reco.recognized = (_sender, event) => {
    console.log('recognized', event.result)
    transcription.push(event.result.text)
  }

  reco.speechEndDetected = async (_sender, _event) => {
    const id = await waClient.sendReplyWithMentions(
      message.from,
      transcription.join(' '),
      message.id
    )
    reco.stopContinuousRecognitionAsync()
    reco.close()

    if (typeof id !== 'boolean') {
      const ai = `${await ask(transcription.join(' '))}`
      await synthesizeText(wav, ai, message)
    }
  }

  // Recognize text and exit
  reco.startContinuousRecognitionAsync()
}

export const synthesizeText = async (
  wav: string,
  text: string,
  message: Message
) => {
  const sConfig = SpeechConfig.fromSubscription(botOptions.azureKey, 'eastus')
  sConfig.speechSynthesisLanguage = botOptions.azureLanguage
  sConfig.speechSynthesisVoiceName = 'pt-BR-FabioNeural'

  const synt = SpeechSynthesizer.FromConfig(
    sConfig,
    AutoDetectSourceLanguageConfig.fromLanguages([
      'en-US',
      botOptions.azureLanguage
    ]),
    AudioConfig.fromAudioFileOutput(wav)
  )
  synt.speakTextAsync(text, async (_result) => {
    await waClient.sendPtt(message.from, wav, message.id)
  })
}
