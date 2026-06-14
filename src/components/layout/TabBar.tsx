import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { EditorDocument } from '../../editor/types'
import { useEditorStore } from '../../stores/editorStore'
import { getFileIcon } from '../../utils/fileIcons'

type EditorTabProps = {
  tab: EditorDocument
  isActive: boolean
}

function EditorTab({ tab, isActive }: EditorTabProps) {
  const [hovered, setHovered] = useState(false)
  const selectTab = useEditorStore((s) => s.selectTab)
  const closeTab = useEditorStore((s) => s.closeTab)
  const FileIcon = getFileIcon(tab.name)

  const showClose = isActive || hovered

  return (
    <div
      role="tab"
      aria-selected={isActive}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        'group relative flex h-[35px] max-w-[200px] min-w-[120px] shrink-0 cursor-pointer items-center',
        'border-r border-[var(--border-subtle)] transition-colors duration-150',
        isActive
          ? 'z-[1] -mb-px border-t-2 border-t-[var(--accent-primary)] bg-[var(--bg-editor)] text-[var(--text-primary)]'
          : 'border-t-2 border-t-transparent bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]',
      ].join(' ')}
      onClick={() => selectTab(tab.id)}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault()
          closeTab(tab.id)
        }
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 pl-2.5 pr-1">
        <FileIcon
          size={14}
          className={[
            'shrink-0',
            isActive ? 'text-[var(--bloom-lavender)]' : 'text-[var(--text-muted)]',
          ].join(' ')}
        />
        <span className="min-w-0 flex-1 truncate text-[12px] leading-none">
          {tab.isDirty && (
            <span className="mr-0.5 text-[var(--accent-primary)]" aria-hidden>
              ●
            </span>
          )}
          {tab.name}
        </span>
      </div>

      <div className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center">
        {showClose && (
          <button
            type="button"
            aria-label={`Close ${tab.name}`}
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
            className={[
              'flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)]',
              'text-[var(--text-muted)] transition-colors duration-150',
              'hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]',
              !isActive && 'opacity-0 group-hover:opacity-100',
            ].join(' ')}
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  )
}

export function TabBar() {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [activeTabId])

  if (tabs.length === 0) return null

  return (
    <div
      className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      role="tablist"
      aria-label="Open editors"
    >
      <div
        ref={scrollRef}
        className="editor-tab-scroll flex h-[35px] overflow-x-auto overflow-y-hidden"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div key={tab.id} ref={isActive ? activeTabRef : undefined}>
              <EditorTab tab={tab} isActive={isActive} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
