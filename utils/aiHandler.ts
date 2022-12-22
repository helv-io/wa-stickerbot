import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai'
//import { ChatGPTAPI } from '@oceanlvr/chatgpt'

const org = process.env.OPENAI_API_ORG
const key = process.env.OPENAI_API_KEY
const session = process.env.SB_OPENAI_SESSION
/*const api = new ChatGPTAPI({
  sessionToken: session || '',
  markdown: false
})
process.env.SB_OPENAI_SESSION*/

export const ask = async (question: string, user: string) => {
  if (session) {
    /*if (!(await api.getIsAuthenticated())) {
      await api.ensureAuth()
    }
    const response = await api.sendMessage(question, { conversationId: user })
    return response*/
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
