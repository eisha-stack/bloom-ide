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

export type ChatContext = {
  activeFileName?: string | null
  activeFileContent?: string | null
  workspacePath?: string | null
  language?: string | null
}

export type StreamChunk = {
  type: 'delta' | 'done' | 'error'
  content?: string
  error?: string
}

export type ChatCompletionRequest = {
  messages: ChatMessage[]
  context: ChatContext
  signal?: AbortSignal
}

export type AIProviderId = 'mock' | 'openai' | 'anthropic' | 'cursor'

export interface AIProvider {
  readonly id: AIProviderId
  readonly name: string
  readonly supportsStreaming: boolean
  streamChat(request: ChatCompletionRequest): AsyncGenerator<StreamChunk, void>
}

export type AIProviderConfig = {
  activeProviderId: AIProviderId
}
