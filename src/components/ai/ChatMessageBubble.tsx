import { motion } from 'framer-motion'
import { BloomLogo } from '../ui/BloomLogo'
import type { ChatMessage } from '../../lib/ai'
import { MarkdownContent } from './MarkdownContent'

type ChatMessageBubbleProps = {
  message: ChatMessage
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={[
        'max-w-[95%] rounded-[var(--radius-md)] px-3 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.12)]',
        isUser
          ? 'ml-auto bg-gradient-to-br from-[rgba(255,105,180,0.2)] to-[rgba(168,85,247,0.15)] text-[var(--text-primary)]'
          : 'glass-panel text-[var(--text-secondary)]',
      ].join(' ')}
    >
      {!isUser && (
        <div className="mb-1.5 flex items-center gap-1.5">
          <BloomLogo size="xs" alt="" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Bloom AI
          </span>
        </div>
      )}

      {isUser ? (
        <p className="m-0 whitespace-pre-wrap text-[12px] leading-relaxed">{message.content}</p>
      ) : (
        <MarkdownContent content={message.content} isStreaming={message.isStreaming} />
      )}
    </motion.div>
  )
}
