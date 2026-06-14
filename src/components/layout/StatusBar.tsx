import { AlertTriangle, CircleX, GitBranch, Loader2 } from 'lucide-react'
import type { SaveStatus } from '../../stores/editorStore'
import { BloomLogo } from '../ui/BloomLogo'

type StatusBarProps = {
  branch?: string
  language?: string | null
  line?: number
  column?: number
  errors?: number
  warnings?: number
  aiStatus?: 'ready' | 'thinking' | 'offline'
  saveStatus?: SaveStatus
  isDirty?: boolean
}

export function StatusBar({
  branch = 'main',
  language,
  line = 1,
  column = 1,
  errors = 0,
  warnings = 2,
  aiStatus = 'ready',
  saveStatus = 'idle',
  isDirty = false,
}: StatusBarProps) {
  const aiLabel =
    aiStatus === 'ready' ? 'AI Ready' : aiStatus === 'thinking' ? 'AI Thinking…' : 'AI Offline'

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : isDirty
            ? 'Unsaved changes'
            : null

  return (
    <footer className="relative flex h-[24px] shrink-0 items-center justify-between overflow-hidden px-3 text-[11px] text-[var(--text-secondary)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(255,105,180,0.08)] via-[var(--bg-card)] to-[rgba(168,85,247,0.08)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-pink-glow)] to-transparent opacity-50"
      />

      <div className="relative flex items-center gap-3">
        <span className="flex items-center gap-1">
          <GitBranch size={11} className="text-[var(--bloom-lavender)]" />
          {branch}
        </span>

        {saveLabel && (
          <span
            className={[
              'flex items-center gap-1',
              saveStatus === 'error' ? 'text-[var(--error)]' : 'text-[var(--bloom-lilac)]',
            ].join(' ')}
          >
            {saveStatus === 'saving' && <Loader2 size={11} className="animate-spin" />}
            {saveLabel}
          </span>
        )}

        <span className="flex items-center gap-1 text-[var(--error)]">
          <CircleX size={11} />
          {errors} {errors === 1 ? 'Error' : 'Errors'}
        </span>

        <span className="flex items-center gap-1 text-[var(--warning)]">
          <AlertTriangle size={11} />
          {warnings} {warnings === 1 ? 'Warning' : 'Warnings'}
        </span>
      </div>

      <div className="relative flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <BloomLogo
            size="xs"
            glow={aiStatus === 'ready'}
            className={aiStatus !== 'ready' ? 'opacity-50' : undefined}
          />
          {aiLabel}
        </span>

        {language && <span className="capitalize">{language}</span>}

        <span>
          Ln {line}, Col {column}
        </span>
      </div>
    </footer>
  )
}
