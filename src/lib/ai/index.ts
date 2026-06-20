export type {
  AIProvider,
  AIProviderId,
  AIProviderConfig,
  ChatCompletionRequest,
  ChatContext,
  ChatMessage,
  Conversation,
  LLMContext,
  LLMContextBudget,
  LLMContextFormatOptions,
  LLMContextInclude,
  LLMContextSummary,
  MessageRole,
  StreamChunk,
} from './types'

export {
  collectLLMContext,
  summarizeLLMContext,
  buildContextSystemPrompt,
  buildPromptFromIDE,
  DEFAULT_CONTEXT_BUDGET,
  DEFAULT_CONTEXT_INCLUDE,
} from './context'

export { getAIProvider, listAvailableProviders, mockProvider, openrouterProvider } from './providers'
export {
  DEFAULT_OPENROUTER_MODEL,
  OPENROUTER_MODELS,
  streamOpenRouterChat,
} from './openrouter'
export { CODE_ACTIONS, buildCodeActionPrompt, getCodeAction } from './codeActions'
export type { CodeAction, CodeActionId } from './codeActions'
