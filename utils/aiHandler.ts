import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai'
import { ChatGPTAPIBrowser } from 'chatgpt'

const org = process.env.OPENAI_API_ORG
const key = process.env.OPENAI_API_KEY
const email = process.env.SB_OPENAI_EMAIL || ''
const password = process.env.SB_OPENAI_PASSWORD || ''
const gpt = new ChatGPTAPIBrowser({
  email,
  password,
  markdown: false
})

export const ask = async (question: string, user: string) => {
  if (email && password) {
    if (!(await gpt.getIsAuthenticated())) {
      await gpt.initSession()
    }
    const gptResponse = await gpt.sendMessage(question, { messageId: user })
    return gptResponse.response
  } else if (org && key) {
    const completionRequest: CreateCompletionRequest = {
      model: 'code-davinci-002',
      prompt: `//Human readable\nQ: ${question}\nA:`,
      stop: '\n',
      temperature: 0.25,
      max_tokens: 1024,
      frequency_penalty: 1
    }
    const configuration = new Configuration({
      organization: org,
      apiKey: key
    })
    const openai = new OpenAIApi(configuration)
    const aiResponse = (await openai.createCompletion(completionRequest)).data
      .choices
    if (aiResponse) {
      return aiResponse[0].text
    }
    return '👎'
  }
}
