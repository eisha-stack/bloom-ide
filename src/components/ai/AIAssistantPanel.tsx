import { AnimatePresence, motion } from 'framer-motion'
import {
  Bug,
  Code2,
  Lightbulb,
  Send,
  Sparkles,
  Wand2,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const SUGGESTED_PROMPTS = [
  { label: 'Explain this function', icon: Lightbulb },
  { label: 'Fix bugs', icon: Bug },
  { label: 'Generate React component', icon: Code2 },
  { label: 'Optimize code', icon: Zap },
] as const

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type AIAssistantPanelProps = {
  open: boolean
  onClose: () => void
  activeFileName?: string | null
}

export function AIAssistantPanel({ open, onClose, activeFileName }: AIAssistantPanelProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Bloom AI. Ask me anything about your code — I can explain, fix, generate, and optimize.",
    },
  ])

  const sendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: activeFileName
        ? `I'll help with "${trimmed}" in ${activeFileName}. (AI integration coming soon!)`
        : `I'll help with "${trimmed}". Open a file for context-aware assistance.`,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex shrink-0 flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shadow-[-8px_0_32px_rgba(0,0,0,0.2)]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--bloom-blush)] to-[var(--accent-purple-glow)] shadow-[0_0_12px_rgba(255,105,180,0.2)]">
                <Sparkles size={14} className="text-white" />
              </div>
              <h2 className="m-0 font-[family-name:var(--font-heading)] text-[13px] font-semibold text-[var(--text-primary)]">
                AI Assistant
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close AI panel"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)]"
            >
              <X size={14} />
            </button>
          </div>

          {/* Suggested prompts */}
          <div className="shrink-0 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Suggested
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map(({ label, icon: Icon }) => (
                <motion.button
                  key={label}
                  type="button"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(label)}
                  className="glass-panel flex items-center gap-2 px-2.5 py-2 text-left text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[rgba(255,182,193,0.2)] hover:text-[var(--text-primary)]"
                >
                  <Icon size={13} className="shrink-0 text-[var(--bloom-lavender)]" />
                  <span className="leading-tight">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={[
                  'max-w-[95%] rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] leading-relaxed shadow-[0_2px_12px_rgba(0,0,0,0.15)]',
                  msg.role === 'user'
                    ? 'ml-auto bg-gradient-to-br from-[rgba(255,105,180,0.2)] to-[rgba(168,85,247,0.15)] text-[var(--text-primary)]'
                    : 'glass-panel text-[var(--text-secondary)]',
                ].join(' ')}
              >
                {msg.role === 'assistant' && (
                  <Sparkles
                    size={11}
                    className="mb-1 inline text-[var(--bloom-lavender)]"
                  />
                )}{' '}
                {msg.content}
              </motion.div>
            ))}
          </div>

          {/* Code generation + input */}
          <div className="shrink-0 border-t border-[var(--border-subtle)] p-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => sendMessage('Generate code for this file')}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--accent-pink-glow)] to-[var(--accent-purple-glow)] px-3 py-2 text-[12px] font-medium text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] transition-shadow hover:shadow-[0_4px_20px_rgba(255,105,180,0.35)]"
            >
              <Wand2 size={14} />
              Generate Code
            </motion.button>

            <div className="glass-panel flex items-end gap-2 p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder="Ask Bloom AI..."
                rows={2}
                aria-label="Message AI assistant"
                className="min-h-[40px] flex-1 resize-none bg-transparent text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--bloom-pink)] to-[var(--accent-purple-glow)] text-white shadow-[0_0_12px_rgba(255,105,180,0.3)]"
              >
                <Send size={14} />
              </motion.button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
