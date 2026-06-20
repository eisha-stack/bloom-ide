export type MessageRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  isStreaming?: boolean
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export type { LLMContext as ChatContext, LLMContext } from './context/types'
export type {
  LLMContextBudget,
  LLMContextFormatOptions,
  LLMContextInclude,
  LLMContextSummary,
} from './context/types'

import type { LLMContext } from './context/types'

export type StreamChunk = {
  type: 'delta' | 'done' | 'error'
  content?: string
  error?: string
}

export type AIProviderConfig = {
  openRouterApiKey?: string
  openRouterModel?: string
}

export type ChatCompletionRequest = {
  messages: ChatMessage[]
  context: LLMContext
  signal?: AbortSignal
  config?: AIProviderConfig
}

export type AIProviderId = 'mock' | 'openrouter' | 'openai' | 'anthropic' | 'cursor'

export interface AIProvider {
  readonly id: AIProviderId
  readonly name: string
  readonly supportsStreaming: boolean
  streamChat(request: ChatCompletionRequest): AsyncGenerator<StreamChunk, void>
}
