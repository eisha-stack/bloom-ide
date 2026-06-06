import { AlertTriangle, CircleX, GitBranch } from 'lucide-react'
import { BloomLogo } from '../ui/BloomLogo'

type StatusBarProps = {
  branch?: string
  language?: string | null
  line?: number
  column?: number
  errors?: number
  warnings?: number
  aiStatus?: 'ready' | 'thinking' | 'offline'
}

export function StatusBar({
  branch = 'main',
  language,
  line = 1,
  column = 1,
  errors = 0,
  warnings = 2,
  aiStatus = 'ready',
}: StatusBarProps) {
  const aiLabel =
    aiStatus === 'ready' ? 'AI Ready' : aiStatus === 'thinking' ? 'AI Thinking…' : 'AI Offline'

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
