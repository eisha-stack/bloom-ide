import { create } from 'zustand'
import { getAIProvider } from '../lib/ai'
import { collectLLMContext } from '../lib/ai/context'
import type { LLMContext, ChatMessage, Conversation } from '../lib/ai'
import { getAISettingsConfig } from './settingsStore'

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm **Bloom AI**. Ask me to explain, fix, generate, or optimize your code — I support markdown and syntax-highlighted snippets.",
  createdAt: Date.now(),
}

function createId() {
  return crypto.randomUUID()
}

function titleFromMessage(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= 42) return trimmed
  return `${trimmed.slice(0, 42)}…`
}

function createConversation(title = 'New chat'): Conversation {
  const now = Date.now()
  return {
    id: createId(),
    title,
    messages: [{ ...WELCOME_MESSAGE, id: createId(), createdAt: now }],
    createdAt: now,
    updatedAt: now,
  }
}

type AiStore = {
  conversations: Conversation[]
  activeConversationId: string | null
  inputDraft: string
  isStreaming: boolean
  error: string | null
  abortController: AbortController | null
  showHistory: boolean

  setInputDraft: (value: string) => void
  setShowHistory: (show: boolean) => void
  createNewConversation: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  sendMessage: (text: string, context?: LLMContext) => Promise<void>
  stopGeneration: () => void
  clearError: () => void
}

function updateConversation(
  conversations: Conversation[],
  conversationId: string,
  updater: (conversation: Conversation) => Conversation,
): Conversation[] {
  return conversations.map((c) => (c.id === conversationId ? updater(c) : c))
}

export const useAiStore = create<AiStore>((set, get) => {
  const initialConversation = createConversation()

  return {
    conversations: [initialConversation],
    activeConversationId: initialConversation.id,
    inputDraft: '',
    isStreaming: false,
    error: null,
    abortController: null,
    showHistory: false,

    setInputDraft: (value) => set({ inputDraft: value }),
    setShowHistory: (show) => set({ showHistory: show }),
    clearError: () => set({ error: null }),

    createNewConversation: () => {
      const conversation = createConversation()
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        activeConversationId: conversation.id,
        inputDraft: '',
        error: null,
        showHistory: false,
      }))
    },

    selectConversation: (id) => {
      set({ activeConversationId: id, showHistory: false, error: null })
    },

    deleteConversation: (id) => {
      set((state) => {
        const next = state.conversations.filter((c) => c.id !== id)
        if (next.length === 0) {
          const fresh = createConversation()
          return {
            conversations: [fresh],
            activeConversationId: fresh.id,
          }
        }

        const activeConversationId =
          state.activeConversationId === id ? next[0].id : state.activeConversationId

        return { conversations: next, activeConversationId }
      })
    },

    stopGeneration: () => {
      get().abortController?.abort()
      set({ abortController: null, isStreaming: false })
    },

    sendMessage: async (text, contextOverride) => {
      const trimmed = text.trim()
      if (!trimmed || get().isStreaming) return

      const context = contextOverride ?? collectLLMContext()

      const { activeConversationId, conversations } = get()
      if (!activeConversationId) return

      const aiSettings = getAISettingsConfig()
      const providerId = aiSettings.aiProviderId

      const conversation = conversations.find((c) => c.id === activeConversationId)
      if (!conversation) return

      const now = Date.now()
      const userMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content: trimmed,
        createdAt: now,
      }

      const assistantId = createId()
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: now,
        isStreaming: true,
      }

      const isFirstUserMessage = conversation.messages.every((m) => m.role !== 'user')
      const nextTitle = isFirstUserMessage ? titleFromMessage(trimmed) : conversation.title

      set((state) => ({
        inputDraft: '',
        error: null,
        isStreaming: true,
        conversations: updateConversation(state.conversations, activeConversationId, (c) => ({
          ...c,
          title: nextTitle,
          updatedAt: now,
          messages: [...c.messages, userMessage, assistantMessage],
        })),
      }))

      const abortController = new AbortController()
      set({ abortController })

      try {
        const provider = getAIProvider(providerId)
        const currentConversation = get().conversations.find((c) => c.id === activeConversationId)
        const messages = currentConversation?.messages.filter((m) => m.id !== assistantId) ?? []

        for await (const chunk of provider.streamChat({
          messages,
          context,
          signal: abortController.signal,
          config: {
            openRouterApiKey: aiSettings.openRouterApiKey,
            openRouterModel: aiSettings.openRouterModel,
          },
        })) {
          if (chunk.type === 'delta' && chunk.content) {
            set((state) => ({
              conversations: updateConversation(
                state.conversations,
                activeConversationId,
                (c) => ({
                  ...c,
                  updatedAt: Date.now(),
                  messages: c.messages.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + chunk.content }
                      : m,
                  ),
                }),
              ),
            }))
          }

          if (chunk.type === 'error') {
            throw new Error(chunk.error ?? 'Stream failed.')
          }
        }

        set((state) => ({
          isStreaming: false,
          abortController: null,
          conversations: updateConversation(
            state.conversations,
            activeConversationId,
            (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantId ? { ...m, isStreaming: false } : m,
              ),
            }),
          ),
        }))
      } catch (error) {
        const message =
          error instanceof DOMException && error.name === 'AbortError'
            ? 'Generation stopped.'
            : error instanceof Error
              ? error.message
              : 'Failed to get a response.'

        set((state) => ({
          isStreaming: false,
          abortController: null,
          error: message,
          conversations: updateConversation(
            state.conversations,
            activeConversationId,
            (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      isStreaming: false,
                      content: m.content || `*${message}*`,
                    }
                  : m,
              ),
            }),
          ),
        }))
      }
    },
  }
})

export function useAi() {
  const conversations = useAiStore((s) => s.conversations)
  const activeConversationId = useAiStore((s) => s.activeConversationId)
  const inputDraft = useAiStore((s) => s.inputDraft)
  const isStreaming = useAiStore((s) => s.isStreaming)
  const error = useAiStore((s) => s.error)
  const showHistory = useAiStore((s) => s.showHistory)

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0] ?? null

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages: activeConversation?.messages ?? [],
    inputDraft,
    isStreaming,
    error,
    showHistory,
    setInputDraft: useAiStore.getState().setInputDraft,
    setShowHistory: useAiStore.getState().setShowHistory,
    createNewConversation: useAiStore.getState().createNewConversation,
    selectConversation: useAiStore.getState().selectConversation,
    deleteConversation: useAiStore.getState().deleteConversation,
    sendMessage: useAiStore.getState().sendMessage,
    stopGeneration: useAiStore.getState().stopGeneration,
    clearError: useAiStore.getState().clearError,
  }
}
