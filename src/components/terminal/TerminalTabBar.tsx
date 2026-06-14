import { ChevronDown, Plus, TerminalSquare, Trash2, X } from 'lucide-react'
import { useTerminalStore } from '../../stores/terminalStore'
import type { ShellKind } from '../../lib/tauri/terminal'

const SHELL_OPTIONS: { id: ShellKind; label: string }[] = [
  { id: 'powershell', label: 'PowerShell' },
  { id: 'cmd', label: 'CMD' },
  { id: 'bash', label: 'Bash' },
]

export function TerminalTabBar() {
  const tabs = useTerminalStore((s) => s.tabs)
  const activeTabId = useTerminalStore((s) => s.activeTabId)
  const selectTab = useTerminalStore((s) => s.selectTab)
  const closeTab = useTerminalStore((s) => s.closeTab)
  const addTab = useTerminalStore((s) => s.addTab)
  const setPanelOpen = useTerminalStore((s) => s.setPanelOpen)

  return (
    <div className="flex h-[35px] shrink-0 items-center border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex min-w-0 flex-1 items-center overflow-x-auto">
        <div className="flex shrink-0 items-center gap-1 border-r border-[var(--border-subtle)] px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
          <TerminalSquare size={13} className="text-[var(--bloom-lavender)]" />
          Terminal
        </div>

        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={[
                'group flex h-[35px] max-w-[180px] min-w-[110px] shrink-0 items-center gap-1.5 border-r border-[var(--border-subtle)] px-2.5 text-left transition-colors',
                isActive
                  ? 'bg-[var(--bg-editor)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]',
              ].join(' ')}
            >
              <TerminalSquare size={12} className="shrink-0 text-[var(--bloom-purple)]" />
              <span className="min-w-0 flex-1 truncate text-[12px]">{tab.title}</span>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Close ${tab.title}`}
                onClick={(event) => {
                  event.stopPropagation()
                  closeTab(tab.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    closeTab(tab.id)
                  }
                }}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] group-hover:opacity-100"
              >
                <X size={12} />
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 px-1.5">
        <div className="relative group/shell">
          <button
            type="button"
            aria-label="New terminal"
            onClick={() => addTab()}
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--bloom-lilac)]"
          >
            <Plus size={14} />
          </button>
          <div className="pointer-events-none absolute right-0 top-full z-20 mt-1 hidden min-w-[140px] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-soft)] group-hover/shell:pointer-events-auto group-hover/shell:block">
            {SHELL_OPTIONS.map((shell) => (
              <button
                key={shell.id}
                type="button"
                onClick={() => addTab(shell.id)}
                className="flex w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[12px] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
              >
                {shell.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Kill terminal"
          onClick={() => activeTabId && closeTab(activeTabId)}
          disabled={!activeTabId}
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--error)] disabled:opacity-30"
        >
          <Trash2 size={14} />
        </button>

        <button
          type="button"
          aria-label="Collapse terminal panel"
          onClick={() => setPanelOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  )
}
