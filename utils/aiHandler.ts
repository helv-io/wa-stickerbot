import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai'
import { ChatGPTAPI } from 'chatgpt-commonjs'

const org = process.env.OPENAI_API_ORG
const key = process.env.OPENAI_API_KEY
const session = process.env.SB_OPENAI_SESSION
const clearance = process.env.SB_OPENAI_CLEARANCE
let api: ChatGPTAPI
if (session && clearance) {
  api = new ChatGPTAPI({
    sessionToken: session,
    clearanceToken: clearance,
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux aarch64; rv:108.0) Gecko/20100101 Firefox/108.0',
    markdown: false
  })
}

export const ask = async (question: string, user: string) => {
  if (session && clearance) {
    if (!(await api.getIsAuthenticated())) {
      await api.ensureAuth()
    }
    const response = await api.sendMessage(question, { conversationId: user })
    return response
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
