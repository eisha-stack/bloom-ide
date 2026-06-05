import { GitBranch } from 'lucide-react'

type StatusBarProps = {
  branch?: string
  language?: string | null
  line?: number
  column?: number
}

export function StatusBar({
  branch = 'main',
  language,
  line = 1,
  column = 1,
}: StatusBarProps) {
  return (
    <footer className="flex h-[22px] shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 text-[11px] text-[var(--text-secondary)]">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <GitBranch size={11} className="text-[var(--bloom-lavender)]" />
          {branch}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden />
          Ready
        </span>
      </div>
      <div className="flex items-center gap-3">
        {language && (
          <span className="capitalize">{language}</span>
        )}
        <span>
          Ln {line}, Col {column}
        </span>
        <span>UTF-8</span>
      </div>
    </footer>
  )
}
