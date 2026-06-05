import { X } from 'lucide-react'
import type { OpenTab } from '../../types/ide'

type TabBarProps = {
  tabs: OpenTab[]
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
      className="flex shrink-0 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)]"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={[
              'group relative flex max-w-[180px] shrink-0 items-center gap-2 border-r border-[var(--border-subtle)] px-3 py-2 transition-colors duration-200',
              isActive
                ? 'bg-[var(--bg-editor)] text-[var(--text-primary)]'
                : 'bg-transparent text-[var(--text-muted)] hover:bg-[rgba(42,36,56,0.5)] hover:text-[var(--text-secondary)]',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => onSelect(tab.id)}
              className="min-w-0 flex-1 truncate text-left text-[12px]"
            >
              {tab.name}
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.name}`}
              onClick={(e) => {
                e.stopPropagation()
                onClose(tab.id)
              }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-[rgba(255,182,193,0.12)]"
            >
              <X size={12} />
            </button>
            {isActive && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[var(--accent-pink-glow)] to-[var(--accent-purple-glow)]"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
