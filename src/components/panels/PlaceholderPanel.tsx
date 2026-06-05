import type { LucideIcon } from 'lucide-react'

type PlaceholderPanelProps = {
  title: string
  description: string
  icon: LucideIcon
}

export function PlaceholderPanel({ title, description, icon: Icon }: PlaceholderPanelProps) {
  return (
    <div className="flex h-full flex-col p-4">
      <header className="mb-4">
        <h2 className="m-0 font-[family-name:var(--font-heading)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {title}
        </h2>
      </header>
      <div className="glass-panel flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[rgba(255,182,193,0.1)]">
          <Icon size={24} className="text-[var(--bloom-lavender)]" />
        </div>
        <p className="m-0 max-w-[200px] text-[13px] leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  )
}
