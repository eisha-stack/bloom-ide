import type { AIProvider } from '../types'
import { streamOpenRouterChat } from '../openrouter'

export const openrouterProvider: AIProvider = {
  id: 'openrouter',
  name: 'OpenRouter',
  supportsStreaming: true,

  streamChat(request) {
    return streamOpenRouterChat(request)
  },
}
