import {
  AlertCircle,
  FileDiff,
  FilePlus2,
  FileX2,
  GitBranch,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useEffect } from 'react'
import type { GitFileChange } from '../../lib/tauri/git'
import { isTauri } from '../../lib/tauri'
import { useScm } from '../../stores/scmStore'

function ChangeSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  if (count === 0) return null

  return (
    <section className="mb-3">
      <h3 className="m-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
        {title} ({count})
      </h3>
      <ul className="m-0 list-none p-0">{children}</ul>
    </section>
  )
}

function ChangeItem({
  change,
  icon: Icon,
  tone,
}: {
  change: GitFileChange
  icon: typeof FileDiff
  tone: string
}) {
  const fileName = change.path.split('/').pop() ?? change.path

  return (
    <li>
      <div className="flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors hover:bg-[var(--hover-bg)]">
        <Icon size={14} className={['shrink-0', tone].join(' ')} />
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[var(--text-primary)]">{fileName}</p>
          {change.path.includes('/') && (
            <p className="m-0 truncate text-[10px] text-[var(--text-muted)]">{change.path}</p>
          )}
        </div>
        {change.staged && (
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--bloom-lilac)]">
            Staged
          </span>
        )}
      </div>
    </li>
  )
}

function renderChanges(
  changes: GitFileChange[],
  kind: 'modified' | 'added' | 'deleted',
) {
  const config = {
    modified: { icon: FileDiff, tone: 'text-[var(--warning)]' },
    added: { icon: FilePlus2, tone: 'text-[var(--success)]' },
    deleted: { icon: FileX2, tone: 'text-[var(--error)]' },
  }[kind]

  return changes.map((change) => (
    <ChangeItem key={`${kind}-${change.staged}-${change.path}`} change={change} {...config} />
  ))
}

function mergeChanges(...groups: GitFileChange[][]) {
  return groups.flat()
}

export function SourceControlPanel() {
  const {
    status,
    loadState,
    error,
    commitMessage,
    isCommitting,
    refresh,
    setCommitMessage,
    stageAllAndCommit,
  } = useScm()

  useEffect(() => {
    void refresh()
  }, [refresh])

  const modified = mergeChanges(status?.staged.modified ?? [], status?.unstaged.modified ?? [])
  const added = mergeChanges(status?.staged.added ?? [], status?.unstaged.added ?? [])
  const deleted = mergeChanges(status?.staged.deleted ?? [], status?.unstaged.deleted ?? [])

  const canCommit = status?.isRepo && (status.totalChanges > 0 || commitMessage.trim().length > 0)

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <GitBranch size={14} className="shrink-0 text-[var(--bloom-lavender)]" />
          <div className="min-w-0">
            <h2 className="m-0 font-[family-name:var(--font-heading)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Source Control
            </h2>
            {status?.branch && (
              <p className="m-0 truncate text-[11px] text-[var(--bloom-lilac)]">{status.branch}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label="Refresh git status"
          disabled={loadState === 'loading'}
          onClick={() => void refresh()}
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)] disabled:opacity-40"
        >
          <RefreshCw size={14} className={loadState === 'loading' ? 'animate-spin' : undefined} />
        </button>
      </header>

      <div className="shrink-0 border-b border-[var(--border-subtle)] px-3 pb-3">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)"
          rows={3}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault()
              void stageAllAndCommit()
            }
          }}
          className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[rgba(168,85,247,0.35)] focus:shadow-[0_0_0_3px_rgba(168,85,247,0.12)]"
        />
        <button
          type="button"
          disabled={!canCommit || isCommitting || !isTauri()}
          onClick={() => void stageAllAndCommit()}
          className="mt-2 w-full rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--accent-pink-glow)] to-[var(--accent-purple-glow)] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isCommitting ? 'Committing…' : 'Commit'}
        </button>
        {!isTauri() && (
          <p className="m-0 mt-2 text-[10px] text-[var(--text-muted)]">
            Git integration requires the BloomCode desktop app.
          </p>
        )}
      </div>

      {error && (
        <div className="mx-3 mt-3 flex items-start gap-2 rounded-[var(--radius-md)] border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] p-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="m-0 text-[11px] leading-relaxed text-red-300">{error}</p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {loadState === 'loading' && !status && (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <Loader2 size={20} className="animate-spin text-[var(--bloom-lavender)]" />
            <p className="m-0 text-[12px] text-[var(--text-muted)]">Loading git status…</p>
          </div>
        )}

        {status && !status.isRepo && (
          <div className="px-4 py-8 text-center">
            <p className="m-0 text-[13px] text-[var(--text-secondary)]">No git repository</p>
            <p className="m-0 mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
              Open a folder that contains a <code className="text-[var(--bloom-lilac)]">.git</code>{' '}
              directory to use source control.
            </p>
          </div>
        )}

        {status?.isRepo && status.totalChanges === 0 && loadState !== 'loading' && (
          <div className="px-4 py-8 text-center">
            <p className="m-0 text-[13px] text-[var(--text-secondary)]">No changes</p>
            <p className="m-0 mt-2 text-[11px] text-[var(--text-muted)]">
              Your working tree is clean.
            </p>
          </div>
        )}

        {status?.isRepo && status.totalChanges > 0 && (
          <>
            <ChangeSection title="Modified" count={modified.length}>
              {renderChanges(modified, 'modified')}
            </ChangeSection>
            <ChangeSection title="Added" count={added.length}>
              {renderChanges(added, 'added')}
            </ChangeSection>
            <ChangeSection title="Deleted" count={deleted.length}>
              {renderChanges(deleted, 'deleted')}
            </ChangeSection>
          </>
        )}
      </div>
    </div>
  )
}
