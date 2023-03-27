import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai'

const org = process.env.OPENAI_API_ORG
const key = process.env.OPENAI_API_KEY
const base = process.env.OPENAI_API_BASE

export const ask = async (question: string) => {
  if (org && key) {
    const completionRequest: CreateCompletionRequest = {
      model: 'code-davinci-002',
      prompt: question,
      stop: '\n',
      top_p: 0.25,
      max_tokens: 1024,
      frequency_penalty: 1,
      presence_penalty: 1,
      n: 5
    }
    const configuration = new Configuration({
      organization: org,
      apiKey: key,
      basePath: base
    })
    const openai = new OpenAIApi(configuration)
    const aiResponse = await openai.createCompletion(completionRequest)
    const choices = aiResponse.data.choices
    return (
      choices.reduce((prev, choice) => {
        const choiceLength = choice.text ? choice.text.length : 0
        const accLength = prev.text ? prev.text.length : 0
        if (choiceLength > accLength) {
          return choice
        } else {
          return prev
        }
      }).text || '👎'
    )
  }
}
