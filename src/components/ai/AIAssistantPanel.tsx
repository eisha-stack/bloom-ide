import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, History, Plus, X } from 'lucide-react'
import { useCallback } from 'react'
import { useAi } from '../../stores/aiStore'
import { useSettings } from '../../stores/settingsStore'
import { useLLMContext } from '../../hooks/useLLMContext'
import { BloomLogo } from '../ui/BloomLogo'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'
import { ContextBar } from './ContextBar'
import { ConversationHistory } from './ConversationHistory'
import { SuggestedPrompts } from './SuggestedPrompts'

type AIAssistantPanelProps = {
  open: boolean
  onClose: () => void
}

export function AIAssistantPanel({ open, onClose }: AIAssistantPanelProps) {
  const {
    conversations,
    activeConversationId,
    messages,
    inputDraft,
    isStreaming,
    error,
    showHistory,
    setInputDraft,
    setShowHistory,
    createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    stopGeneration,
    clearError,
  } = useAi()
  const { summary } = useLLMContext()
  const { aiProviderId, openRouterModel, hasOpenRouterKey } = useSettings()

  const providerLabel =
    aiProviderId === 'openrouter'
      ? hasOpenRouterKey
        ? `OpenRouter · ${openRouterModel.split('/').pop()}`
        : 'OpenRouter · key required'
      : 'Mock provider'

  const hasUserMessages = messages.some((m) => m.role === 'user')

  const handleSend = useCallback(
    (text?: string) => {
      const payload = text ?? inputDraft
      void sendMessage(payload)
    },
    [inputDraft, sendMessage],
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative flex shrink-0 flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shadow-[-8px_0_32px_rgba(0,0,0,0.2)]"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <div className="flex items-center gap-2">
              <BloomLogo size="sm" glow />
              <div>
                <h2 className="m-0 font-[family-name:var(--font-heading)] text-[13px] font-semibold text-[var(--text-primary)]">
                  AI Assistant
                </h2>
                <p className="m-0 text-[10px] text-[var(--text-muted)]">{providerLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="New chat"
                onClick={createNewConversation}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)]"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                aria-label="Conversation history"
                onClick={() => setShowHistory(true)}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)]"
              >
                <History size={14} />
              </button>
              <button
                type="button"
                aria-label="Close AI panel"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)]"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!hasUserMessages && !isStreaming && (
            <SuggestedPrompts onSelect={handleSend} disabled={isStreaming} />
          )}

          <ChatMessageList messages={messages} isStreaming={isStreaming} />

          {error && (
            <div className="mx-3 mb-2 flex items-start gap-2 rounded-[var(--radius-md)] border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] p-2.5">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[11px] text-red-300">{error}</p>
              </div>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss error"
                className="text-[10px] text-red-300 hover:text-red-200"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="shrink-0 border-t border-[var(--border-subtle)] p-3">
            <ContextBar summary={summary} />
            <ChatInput
              value={inputDraft}
              isStreaming={isStreaming}
              onChange={setInputDraft}
              onSend={() => handleSend()}
              onStop={stopGeneration}
            />
          </div>

          {showHistory && (
            <ConversationHistory
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelect={selectConversation}
              onDelete={deleteConversation}
              onNewChat={createNewConversation}
              onClose={() => setShowHistory(false)}
            />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
