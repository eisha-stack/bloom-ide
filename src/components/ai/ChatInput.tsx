import { motion } from 'framer-motion'
import { Send, Square } from 'lucide-react'

type ChatInputProps = {
  value: string
  isStreaming: boolean
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
}

export function ChatInput({ value, isStreaming, onChange, onSend, onStop }: ChatInputProps) {
  return (
    <div className="glass-panel flex items-end gap-2 p-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!isStreaming) onSend()
          }
        }}
        placeholder="Ask Bloom AI… (Shift+Enter for newline)"
        rows={2}
        disabled={isStreaming}
        aria-label="Message AI assistant"
        className="min-h-[40px] flex-1 resize-none bg-transparent text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] disabled:opacity-60"
      />
      {isStreaming ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          aria-label="Stop generation"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[rgba(248,113,113,0.35)] hover:text-[var(--error)]"
        >
          <Square size={12} fill="currentColor" />
        </motion.button>
      ) : (
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={!value.trim()}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--bloom-pink)] to-[var(--accent-purple-glow)] text-white shadow-[0_0_12px_rgba(255,105,180,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={14} />
        </motion.button>
      )}
    </div>
  )
}
