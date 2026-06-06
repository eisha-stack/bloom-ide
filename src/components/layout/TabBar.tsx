import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { EditorDocument } from '../../editor/types'
import { getFileIcon } from '../../utils/fileIcons'

type TabBarProps = {
  tabs: EditorDocument[]
  activeTabId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

export function TabBar({ tabs, activeTabId, onSelect, onClose }: TabBarProps) {
  if (tabs.length === 0) return null

  return (
    <div
      role="tablist"
      aria-label="Open editors"
      className="flex shrink-0 items-end gap-1 overflow-x-auto bg-[var(--bg-sidebar)] px-2 pt-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        const FileIcon = getFileIcon(tab.name)

        return (
          <motion.div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            layout
            initial={false}
            className={[
              'group relative flex max-w-[200px] shrink-0 items-center gap-1.5 rounded-t-[var(--radius-md)] px-3 py-2 transition-colors duration-200',
              isActive
                ? 'bg-[var(--bg-editor)] text-[var(--text-primary)] shadow-[0_-2px_12px_rgba(255,105,180,0.08)]'
                : 'bg-[rgba(42,36,56,0.4)] text-[var(--text-muted)] hover:bg-[rgba(42,36,56,0.7)] hover:text-[var(--text-secondary)]',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => onSelect(tab.id)}
              className="flex min-w-0 flex-1 items-center gap-1.5"
            >
              <FileIcon
                size={14}
                className={[
                  'shrink-0',
                  isActive ? 'text-[var(--bloom-lavender)]' : 'text-[var(--text-muted)]',
                ].join(' ')}
              />
              <span className="truncate text-[12px]">
                {tab.isDirty && (
                  <span aria-hidden className="mr-1 text-[var(--accent-primary)]">
                    ●
                  </span>
                )}
                {tab.name}
              </span>
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.name}`}
              onClick={(e) => {
                e.stopPropagation()
                onClose(tab.id)
              }}
              className={[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-all duration-150',
                'opacity-0 group-hover:opacity-100',
                'hover:bg-[rgba(255,182,193,0.12)] hover:text-[var(--bloom-blush)]',
                isActive && 'opacity-70',
              ].join(' ')}
            >
              <X size={12} />
            </button>
            {isActive && (
              <motion.span
                layoutId="tab-underline"
                aria-hidden
                className="pointer-events-none absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[var(--accent-pink-glow)] to-[var(--accent-purple-glow)] shadow-[0_0_8px_rgba(255,105,180,0.4)]"
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
