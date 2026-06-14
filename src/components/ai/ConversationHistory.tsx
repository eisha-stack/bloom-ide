import { MessageSquare, Plus, Trash2, X } from 'lucide-react'
import type { Conversation } from '../../lib/ai'

type ConversationHistoryProps = {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNewChat: () => void
  onClose: () => void
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ConversationHistory({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onNewChat,
  onClose,
}: ConversationHistoryProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-[var(--bg-sidebar)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2.5">
        <h3 className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          History
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewChat}
            aria-label="New chat"
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-2">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId

          return (
            <li key={conversation.id} className="mb-1">
              <div
                className={[
                  'group flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 transition-colors',
                  isActive
                    ? 'bg-[rgba(168,85,247,0.12)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                >
                  <MessageSquare size={14} className="mt-0.5 shrink-0 text-[var(--bloom-lavender)]" />
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[12px] font-medium">{conversation.title}</p>
                    <p className="m-0 text-[10px] text-[var(--text-muted)]">
                      {formatRelativeTime(conversation.updatedAt)}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(conversation.id)}
                  aria-label={`Delete ${conversation.title}`}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--error)]"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
